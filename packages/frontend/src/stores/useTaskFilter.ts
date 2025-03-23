import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { create } from "zustand";

/**
 * Zustand store for managing filter state in the application.
 *
 * This store holds the current filter values and provides functions to update them:
 * - `status`: The filter for item status (e.g., active, completed) or `null` if not set.
 * - `sortBy`: The key used to sort items (e.g., title, dueDate) or `null` if not set.
 * - `search`: The search term used to filter items by title or `null` if not set.
 * - `order`: The sorting order, either "asc" (ascending) or "desc" (descending), defaulting to "desc".
 *
 * The store also includes setter functions to update each filter value.
 */
const useFilterFilter = create<FilterParams>((set) => ({
  status: null,
  sortBy: null,
  search: null,
  order: "desc",

  setStatus: (value) => set({ status: value }),
  setSortBy: (value) => set({ sortBy: value }),
  setSearch: (value) => set({ search: value }),
  setOrder: (value) => set({ order: value }),
}));

/**
 * Custom hook to initialize filter state from URL search parameters.
 *
 * This hook reads query parameters from the current URL and updates the Zustand filter store
 * so that the application's filter state is synchronized with the URL.
 *
 * URL Parameters Handled:
 * - `status`: Sets the filter state for item status.
 * - `sortBy`: Sets the sorting key for the items.
 * - `title`: Sets the search term used to filter items.
 * - `order`: Sets the sort order; defaults to "desc" if not provided.
 *
 * The hook uses the `useEffect` hook to trigger the update when URL parameters change.
 */
export const useInitializeFilterFromURL = () => {
  const params = useSearchParams();
  const { setStatus, setSortBy, setSearch, setOrder } = useFilterFilter();

  useEffect(() => {
    // Extract filter parameters from the URL
    const statusParam = params.get("status");
    const keyParam = params.get("sortBy") as URLParams["sortBy"];
    const searchParam = params.get("title");
    const orderParam = params.get("order") as URLParams["order"];

    // Update the store with the URL parameters
    setSortBy(keyParam);
    setSearch(searchParam);
    setStatus(statusParam);
    setOrder(orderParam || "desc"); // Default to "desc" if no order is provided.
  }, [params, setStatus, setSortBy, setSearch, setOrder]);
};

export default useFilterFilter;
