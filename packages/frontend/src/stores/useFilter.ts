import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { create } from "zustand";

/**
 * Interface defining the filter parameters and state management functions.
 */
interface FilterParams {
  status: URLParams["status"]; // The status filter (e.g., "active", "completed").
  setStatus: (value: URLParams["status"]) => void; // Function to update the status filter.
  sortBy: URLParams["sortBy"]; // The sorting criteria (e.g., "date", "priority").
  setSortBy: (value: URLParams["sortBy"]) => void; // Function to update the sorting criteria.
  search: URLParams["title"]; // The search query string.
  setSearch: (value: URLParams["title"]) => void; // Function to update the search query.
  order: URLParams["order"]; // The sorting order ("asc" or "desc").
  setOrder: (value: URLParams["order"]) => void; // Function to update the sorting order.
}

/**
 * Zustand store for managing filter states in the application.
 * Provides functions to update and reset filters.
 */
const useFilter = create<FilterParams>((set, remove) => ({
  status: null,
  sortBy: null,
  search: null,
  order: "desc", // Default order is descending.

  setStatus: (value) => set({ status: value }),
  setSortBy: (value) => set({ sortBy: value }),
  setSearch: (value) => set({ search: value }),
  setOrder: (value) => set({ order: value }),
}));

/**
 * Custom hook to initialize filter state from URL parameters.
 * This ensures that the Zustand state reflects the current URL query parameters.
 */
export const useInitializeFilterFromURL = () => {
  const params = useSearchParams();
  const { setStatus, setSortBy, setSearch, setOrder } = useFilter();

  useEffect(() => {
    const statusParam = params.get("status");
    const keyParam = params.get("sortBy") as URLParams["sortBy"];
    const searchParam = params.get("title");
    const orderParam = params.get("order") as URLParams["order"];

    setSortBy(keyParam);
    setSearch(searchParam);
    setStatus(statusParam);
    setOrder(orderParam || "desc"); // Default to "desc" if no order is provided.
  }, [params]);
};

export default useFilter;
