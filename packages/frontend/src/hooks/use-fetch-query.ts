import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

/**
 * Custom hook for fetching data from an API using React Query.
 *
 * This hook builds an API request URL based on the provided endpoint and query parameters,
 * executes the request, and manages pagination by checking if the requested page exceeds the total pages.
 * If the requested page is greater than the available pages, the hook will redirect to page 1.
 * Additionally, it leverages React Query for caching, automatic retries (up to 3 times), and error handling.
 *
 * @template T - The type of the data expected from the API response.
 *
 * @param {Object} options - The options object.
 * @param {string} options.endpoint - The API endpoint to fetch data from.
 * @param {Record<string, string | number | undefined>} [options.params] - Optional query parameters for the request.
 * @param {unknown[]} options.queryKey - Unique key array for React Query caching.
 *
 * @returns {import('@tanstack/react-query').UseQueryResult<{ data: T; totalPages: number }>}
 *          The query result object containing the fetched data, total pages, and additional metadata such as loading status and errors.
 *
 * @throws Will throw an error after 3 retry attempts if the API request fails.
 *
 * @example
 * // Usage example for fetching user data:
 * const { data, isLoading, error } = useFetchQuery<UserData>({
 *   endpoint: '/api/users',
 *   params: { page: 1, limit: 10 },
 *   queryKey: ['users', 1]
 * });
 */
export function useFetchQuery<T>({
  endpoint,
  params,
  queryKey,
}: {
  endpoint: string;
  params?: Record<string, string | number | undefined>;
  queryKey: unknown[];
}) {
  const router = useRouter();

  /**
   * Function to execute the API request.
   *
   * Builds the URL with query parameters, makes the GET request using the API client,
   * and handles redirection if the requested page is out of range.
   *
   * @returns {Promise<{ data: T; totalPages: number }>} The response from the API.
   */
  const queryFn = async () => {
    const queryParams = new URLSearchParams();

    // Append each defined parameter to the query string
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }

    // Construct the full URL: include query parameters if present
    const url = `${endpoint}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    // Perform the API GET request
    const response = await api.get<{ data: T; totalPages: number }>(url);

    // Check for pagination issues: if the requested page is greater than totalPages, redirect to page 1
    if (
      params?.page &&
      response?.data?.totalPages &&
      Number(params.page) > response.data.totalPages
    ) {
      router.replace(`?page=1`);
    }

    return response;
  };

  return useQuery({
    queryKey: [...queryKey],
    queryFn,
    // Retry failed requests up to 3 times
    retry: 3,
    // Use exponential backoff with a maximum delay of 30 seconds between retries
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Throw error if the query fails after all retry attempts
    throwOnError: true,
  });
}
