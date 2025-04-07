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
  reset: () => set({ status: null, sortBy: null, search: null, order: "desc" }), // Reset all to initial values
}));

export default useGoalFilter;
