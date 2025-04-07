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
const useTaskFilter = create<FilterParams>((set) => ({
  status: null,
  sortBy: null,
  search: null,
  order: "desc",

  setStatus: (value) => set({ status: value }),
  setSortBy: (value) => set({ sortBy: value }),
  setSearch: (value) => set({ search: value }),
  setOrder: (value) => set({ order: value }),
  reset: () => set({ status: null, sortBy: null, search: null, order: "desc" }), // Reset all to initial values
}));

export default useTaskFilter;
