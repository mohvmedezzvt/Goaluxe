"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, Search, ChevronDown, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useEffect } from "react";
import { useDebounce } from "use-debounce";
import Badge from "../ui/badge";
import { useInitializeFilterFromURL } from "@/stores/useGoalFilter";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "../ui/card";

/**
 * Component for filtering and sorting goals or subtasks.
 *
 * This component provides:
 * - A debounced search input for filtering goals/subtasks by title.
 * - A dropdown menu to filter by status and sort by various criteria.
 * - Visual badges representing active filters with options to remove individual filters or clear all at once.
 *
 * URL query parameters are updated in real-time to reflect the current filters:
 * - "title" for the search query.
 * - "status" for the status filter.
 * - "sortBy" for the selected sort key.
 * - "order" for the sort order.
 * - "page" is reset to "1" when filters change.
 *
 * @component
 * @example
 * // Example usage:
 * <Filters
 *   status={currentStatus}
 *   setStatus={setCurrentStatus}
 *   sortBy={currentSortBy}
 *   setSortBy={setCurrentSortBy}
 *   search={currentSearch}
 *   setSearch={setCurrentSearch}
 *   order={currentOrder}
 *   setOrder={setCurrentOrder}
 *   type="goal" // or "subtask"
 * />
 *
 * @param {FilterParams} props - The filter parameters and state setters.
 * @param {Goal["status"] | Subtask["status"] | null} props.status - Current status filter.
 * @param {function} props.setStatus - Setter function for the status filter.
 * @param {URLParams["sortBy"] | null} props.sortBy - Current sort key.
 * @param {function} props.setSortBy - Setter function for the sort key.
 * @param {string | null} props.search - Current search text.
 * @param {function} props.setSearch - Setter function for the search text.
 * @param {URLParams["order"]} props.order - Current sort order ("asc" or "desc").
 * @param {function} props.setOrder - Setter function for the sort order.
 * @param {"goal" | "subtask"} props.type - Type of item to filter (goal or subtask).
 *
 * @returns {JSX.Element} The rendered Filters component.
 *
 * @remarks
 * - Utilizes the useDebounce hook to prevent excessive updates from the search input.
 * - Uses the Next.js router and pathname hooks to update the URL query parameters.
 * - Relies on a custom store (useGoalFilter) for managing filter state and URL initialization.
 */
export function Filters({
  status,
  setStatus,
  sortBy,
  setSortBy,
  search,
  setSearch,
  order,
  setOrder,
  type,
}: FilterParams) {
  const params = new URLSearchParams(window.location.search);
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Handles search input changes.
   *
   * Updates the search state with the current input value.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Debounce the search input to limit updates (500ms delay)
  const [debouncedSearch] = useDebounce(search, 500);

  // Boolean indicating if any filter (status or sortBy) is active
  const isFilter = status || sortBy;

  // Initialize filter state from URL parameters when component mounts
  useInitializeFilterFromURL();

  // Update URL query parameters when the debounced search input changes.
  useEffect(() => {
    if (debouncedSearch) {
      params.set("title", debouncedSearch);
      setSearch(debouncedSearch);
      params.set("page", "1"); // Reset page in URL when search changes
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearch]);

  /**
   * Handles sorting based on a given key and order.
   *
   * Updates the URL parameters and state with the selected sort key and order.
   *
   * @param {URLParams["sortBy"]} sortBy - The key to sort by (e.g., "title", "dueDate", "progress").
   * @param {URLParams["order"]} order - The order of sorting ("asc" or "desc").
   */
  const handleSort = (
    sortBy: URLParams["sortBy"],
    order: URLParams["order"]
  ) => {
    if (sortBy) {
      params.set("sortBy", sortBy);
      setSortBy(sortBy);
      params.set("page", "1"); // Reset page when sorting changes
    } else {
      params.delete("sortBy");
    }
    params.set("order", order);
    setOrder(order);
    router.push(`${pathname}?${params.toString()}`);
  };

  /**
   * Handles filtering by status.
   *
   * Sets the "status" URL parameter and updates the state for the status filter.
   *
   * @param {Goal["status"] | Subtask["status"]} status - The status to filter by.
   */
  const handleStatusFilter = (status: Subtask["status"] | Goal["status"]) => {
    if (status) {
      params.set("status", status);
      setStatus(status);
      params.set("page", "1"); // Reset page when filtering changes
    } else {
      params.delete("status");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  /**
   * Handles removal of a specific filter.
   *
   * Removes the corresponding URL parameter and resets the associated state.
   *
   * @param {string} key - The key of the filter to remove (e.g., "status", "sortBy", "title").
   */
  const handleRemove = (key: string) => {
    params.delete(key);
    if (key === "status") {
      setStatus(null);
    } else if (key === "sortBy") {
      setSortBy(null);
    } else {
      setSearch(null);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  /**
   * Clears all filters by resetting the URL query parameters.
   */
  const handleClear = () => {
    router.replace(`${pathname}`);
  };

  // Remove the "title" parameter if search input becomes empty.
  useEffect(() => {
    if (search === "") {
      handleRemove("title");
    }
  }, [search]);

  return (
    <div className="flex gap-2 items-center">
      {/* Display active filters as badges */}
      <AnimatePresence mode="popLayout">
        <Badge
          key="sortBy"
          filterKey="sortBy"
          filterValue={sortBy}
          onRemove={() => handleRemove("sortBy")}
        />
        <Badge
          key="status"
          filterKey="status"
          filterValue={status}
          onRemove={() => handleRemove("status")}
        />
        {/* Button to clear all active filters */}
        {isFilter && (
          <motion.div
            key="clear"
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.2 }}
          >
            <Button className="capitalize" onClick={() => handleClear()}>
              Clear
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search input field with icon and clear button */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search goals..."
          className="pl-8"
          value={search || ""}
          onChange={(e) => handleSearch(e)}
        />
        {search && (
          <X
            className=" h-4 w-4 absolute right-2.5 top-2.5"
            onClick={() => handleRemove("title")}
          />
        )}
      </div>

      {/* Dropdown menu for filtering and sorting options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Section for filtering by status */}
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {type === "subtask" ? (
            <DropdownMenuItem onClick={() => handleStatusFilter("in-progress")}>
              in-progress
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleStatusFilter("active")}>
              Active
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => handleStatusFilter("completed")}>
            Completed
          </DropdownMenuItem>
          {type === "goal" && (
            <DropdownMenuItem onClick={() => handleStatusFilter("cancelled")}>
              Cancelled
            </DropdownMenuItem>
          )}
          {type === "subtask" && (
            <DropdownMenuItem onClick={() => handleStatusFilter("pending")}>
              pending
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Section for sorting options */}
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleSort("dueDate", order)}>
            Due Date
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort("progress", order)}>
            Progress
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort("title", order)}>
            Title
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Section for choosing sort order */}
          <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={order}>
            <DropdownMenuRadioItem
              value="desc"
              onSelect={() => handleSort(sortBy, "desc")}
            >
              Descending
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="asc"
              onSelect={() => handleSort(sortBy, "asc")}
            >
              Ascending
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Component to display a message when no search results match the filters.
 *
 * Uses a motion animation for smooth appearance.
 *
 * @component
 * @example
 * <NoSearchResults />
 *
 * @returns {JSX.Element} The rendered NoSearchResults component.
 */
export const NoSearchResults = ({ itemType }: { itemType: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full"
    >
      <Card className="flex justify-center items-center p-6 sm:p-8 text-center bg-muted/50 h-full">
        <div>
          <Search className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">No matching {itemType}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      </Card>
    </motion.div>
  );
};
