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
import useFilter, { useInitializeFilterFromURL } from "@/stores/useFilter";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Component for filtering and sorting goals.
 *
 * This component provides a search input for filtering goals by title,
 * and a dropdown menu for filtering by status and sorting by different criteria.
 *
 * @component
 * @example
 * return (
 *   <GoalsFilters />
 * )
 *
 * @returns {JSX.Element} The rendered component.
 *
 * @function
 * @name GoalsFilters
 *
 * @description
 * - Uses a debounced search input to filter goals by title.
 * - Updates the URL query parameters based on the search input.
 * - Provides a dropdown menu for filtering goals by status (all, active, completed, cancelled).
 * - Provides a dropdown menu for sorting goals by due date, progress, or title.
 * - Displays active filters as badges with the ability to clear them individually or all at once.
 *
 * @hook
 * @name useDebounce
 * @description Debounces the search input to avoid excessive updates.
 *
 * @hook
 * @name useEffect
 * @description Updates the URL query parameters when the debounced search input changes.
 *
 * @param {ChangeEvent<HTMLInputElement>} e - The change event for the search input.
 *
 * @callback handleSearch
 * @description Handles the search input change event and updates the search state.
 *
 * @callback handleSort
 * @description Handles sorting goals by the specified key.
 * @param {"title" | "dueDate" | "progress"} key - The key to sort goals by.
 *
 * @callback handleStatusFilter
 * @description Handles filtering goals by the specified status.
 * @param {Goal["status"] | "all"} status - The status to filter goals by.
 *
 * @callback handleClear
 * @description Clears all filters and resets the URL query parameters.
 */
export function GoalsFilters() {
  const params = new URLSearchParams(window.location.search);
  const router = useRouter();
  const pathname = usePathname();

  const {
    status,
    setStatus,
    sortBy,
    setSortBy,
    search,
    setSearch,
    order,
    setOrder,
    clear,
  } = useFilter();

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const [debouncedSearch] = useDebounce(search, 500);

  const isFilter = status || sortBy;

  useInitializeFilterFromURL();

  useEffect(() => {
    if (debouncedSearch) {
      params.set("title", debouncedSearch);
      setSearch(debouncedSearch);
      params.set("page", "1"); // Reset page in URL
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearch]);

  const handleSort = (
    sortBy: URLParams["sortBy"],
    order: URLParams["order"]
  ) => {
    if (sortBy) {
      params.set("sortBy", sortBy);
      setSortBy(sortBy);
      params.set("page", "1"); // Reset page in URL
    } else {
      params.delete("sortBy");
    }
    params.set("order", order);
    setOrder(order);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStatusFilter = (status: Goal["status"]) => {
    if (status) {
      params.set("status", status);
      setStatus(status);
      params.set("page", "1"); // Reset page in URL
    } else {
      params.delete("status");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

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
  const handleClear = () => {
    router.replace(`${pathname}`);
    clear();
  };
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
          onRemove={() => handleRemove("key")}
        />
        <Badge
          key="status"
          filterKey="status"
          filterValue={status}
          onRemove={() => handleRemove("status")}
        />
        {/* Clear all filters button */}
        {isFilter && (
          <motion.div
            key="clear"
            initial={{ opacity: 0, y: 2 }} // Initial state when the badge is added
            animate={{ opacity: 1, y: 0 }} // Animate to this state when the badge is rendered
            exit={{ opacity: 0, y: 2 }} // Animate to this state when the badge is removed
            transition={{ duration: 0.2 }} // Transition duration
          >
            <Button className="capitalize" onClick={() => handleClear()}>
              Clear
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search input with debounced functionality */}
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

      {/* Dropdown menu for filtering and sorting */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Filter by status section */}
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleStatusFilter("active")}>
            Active
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusFilter("completed")}>
            Completed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusFilter("cancelled")}>
            Cancelled
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Sort by section */}
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

          {/* Sort */}
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
