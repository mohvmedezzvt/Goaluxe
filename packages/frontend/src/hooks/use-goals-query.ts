import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetches goals data using React Query with support for filtering, sorting, and pagination.
 *
 * @param {URLParams} params - Query parameters for filtering and sorting:
 * - `title` (string): Filter goals by title (optional).
 * - `page` (number): Current page number for pagination (default: 1).
 * - `status` (string): Filter by goal status (e.g., "active", "completed"). "all" fetches all goals.
 * - `sortBy` (string): Sort results by a specific field (e.g., "dueDate").
 * - `order` (string): Sorting order ("asc" or "desc").
 *
 * @returns {object} React Query result object containing:
 * - `data`: Fetched goals data.
 * - `isLoading`: Boolean indicating if the query is loading.
 * - `isError`: Boolean indicating if an error occurred.
 * - `refetch`: Function to manually refetch the data.
 */
export function useGoalsQuery({
  title,
  page,
  status,
  sortBy,
  order,
}: URLParams) {
  /**
   * Function to fetch goal data from the API with query parameters.
   *
   * @returns {Promise<{ data: Goal[]; total: number; page: number; limit: number; totalPages: number; }>}
   */
  const queryFn = () => {
    const queryParams = new URLSearchParams();

    if (title) queryParams.append("title", title);
    if (page > 1) queryParams.append("page", page.toString());
    if (status && status !== "all") queryParams.append("status", status);
    if (sortBy) queryParams.append("sortBy", sortBy);
    if (order) queryParams.append("order", order);

    return api.get<{
      data: Goal[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/goals${queryParams.toString() ? `?${queryParams.toString()}` : ""}`);
  };

  return useQuery({
    queryKey: ["Goals", title, page, status, sortBy, order], // Unique cache key
    queryFn,
    retry: 3, // Retry up to 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff with a max of 30s
  });
}
