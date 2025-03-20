import { usePathname, useSearchParams as useParams } from "next/navigation";
import { useRouter } from "next/navigation";

/**
 * Custom hook for accessing and managing URL search parameters in a Next.js application.
 *
 * This hook extracts query parameters from the current URL, including:
 * - `title`: The search term (if provided) or `null` if absent.
 * - `status`: The status filter value or `null` if not set.
 * - `sortBy`: The key to sort the data by or `null` if not set.
 * - `page`: The current page number, ensuring a minimum value of 1.
 * - `order`: The sort order, typically "asc" or "desc".
 *
 * Additionally, it provides a helper function `handlePagination` that updates the URL with a new page number.
 *
 * @returns {URLParams & { handlePagination: (newPage: number) => void }}
 *          An object containing the current search parameters and a pagination handler.
 *
 * @example
 * // Usage example within a component:
 * const { title, page, status, sortBy, order, handlePagination } = useSearchParams();
 *
 * // To update the page number:
 * handlePagination(2);
 */
export function useSearchParams(): URLParams & {
  handlePagination: (newPage: number) => void;
} {
  const searchParams = useParams();
  const router = useRouter();
  const pathname = usePathname();

  // Extract query parameters from the URL
  const title = searchParams.get("title") || null;
  const status = searchParams.get("status") || null;
  const sortBy = (searchParams.get("sortBy") as URLParams["sortBy"]) ?? null;
  // Ensure the page number is at least 1
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const order = searchParams.get("order") as URLParams["order"];

  /**
   * Handles pagination by updating the `page` parameter in the URL.
   *
   * When a new page is selected, this function creates a new URL search parameter object,
   * sets the "page" parameter to the new page number, and uses Next.js's router to replace
   * the current URL with the updated query string. This ensures the component reflects the
   * correct page and triggers any associated data fetching.
   *
   * @param {number} newPage - The new page number to navigate to.
   */
  const handlePagination = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());

    router.replace(`${pathname}?${params.toString()}`);
  };

  return { title, page, status, sortBy, order, handlePagination };
}
