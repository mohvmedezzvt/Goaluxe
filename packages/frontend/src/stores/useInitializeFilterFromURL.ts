import { useSearchParams } from "next/navigation";
import useTaskFilter from "./useTaskFilter";
import { useEffect } from "react";
import useGoalFilter from "./useGoalFilter";

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
export const useInitializeFilterFromURL = ({ type }: { type: string }) => {
  const params = useSearchParams();
  const { setStatus, setSortBy, setSearch, setOrder } =
    type === "goal" ? useGoalFilter() : useTaskFilter();
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
