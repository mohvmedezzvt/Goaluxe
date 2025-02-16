"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, Search, ChevronDown } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

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
 * - Provides a dropdown menu for filtering goals by status (all, active, completed, archived).
 * - Provides a dropdown menu for sorting goals by due date, progress, or title.
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
 * @param {keyof Goal} key - The key to sort goals by.
 *
 * @callback handleStatusFilter
 * @description Handles filtering goals by the specified status.
 * @param {Goal["status"] | "all"} status - The status to filter goals by.
 */
export function GoalsFilters() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const params = new URLSearchParams(window.location.search);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    if (debouncedSearch) {
      params.set("title", debouncedSearch);
    } else {
      params.delete("title");
    }
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  }, [debouncedSearch]);

  const handleSort = (key: keyof Goal) => {};

  const handleStatusFilter = (status: Goal["status"] | "all") => {};

  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search goals..."
          className="pl-8"
          onChange={(e) => handleSearch(e)}
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleStatusFilter("all")}>
            All Goals
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusFilter("active")}>
            Active
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusFilter("completed")}>
            Completed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusFilter("archived")}>
            Archived
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleSort("dueDate")}>
            Due Date
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort("progress")}>
            Progress
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort("title")}>
            Title
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
