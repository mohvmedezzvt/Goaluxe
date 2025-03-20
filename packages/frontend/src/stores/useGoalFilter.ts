import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { create } from "zustand";

/**
 * Interface defining the filter parameters and state management functions.
 *
 * This interface should define the shape of the filter state and
 * the functions available for updating that state.
 *
 * Example:
 * interface FilterParams {
 *   status: string | null;
 *   sortBy: string | null;
 *   search: string | null;
 *   order: "asc" | "desc";
 *   setStatus: (value: string | null) => void;
 *   setSortBy: (value: string | null) => void;
 *   setSearch: (value: string | null) => void;
 *   setOrder: (value: "asc" | "desc") => void;
 * }
 */

/**
 * Zustand store for managing filter states in the application.
 *
 * This store holds the current filter state, including:
 * - `status`: The filter for status (e.g., active, completed) or null.
 * - `sortBy`: The key used for sorting (e.g., title, dueDate) or null.
 * - `search`: The search term used to filter results or null.
 * - `order`: The sort order ("asc" for ascending or "desc" for descending), defaulting to "desc".
 *
 * It also provides setter functions to update each of these state values.
 */
const useGoalFilter = create<FilterParams>((set) => ({
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
 *
 * This hook reads URL query parameters and updates the Zustand filter state accordingly.
 * It ensures that the application state reflects the current URL, making the filter state
 * persistent and shareable via the URL.
 *
 * URL parameters handled:
 * - `status`: Updates the status filter.
 * - `sortBy`: Updates the sorting key.
 * - `title`: Updates the search filter.
 * - `order`: Updates the sort order (defaults to "desc" if not provided).
 *
 * The hook leverages a side-effect (using `useEffect`) to update the state whenever the URL parameters change.
 */
export const useInitializeFilterFromURL = () => {
  const params = useSearchParams();
  const { setStatus, setSortBy, setSearch, setOrder } = useGoalFilter();

  useEffect(() => {
    // Retrieve URL parameters and update the filter state.
    const statusParam = params.get("status");
    const keyParam = params.get("sortBy") as URLParams["sortBy"];
    const searchParam = params.get("title");
    const orderParam = params.get("order") as URLParams["order"];

    setSortBy(keyParam);
    setSearch(searchParam);
    setStatus(statusParam);
    setOrder(orderParam || "desc"); // Default to "desc" if no order is provided.
  }, [params, setStatus, setSortBy, setSearch, setOrder]);
};

export default useGoalFilter;
