import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

/**
 * Custom hook for handling search parameters in a Next.js application.
 *
 * @returns {Object} - Contains `title`, `page`, `status`, `key`, and `handlePagination` function.
 */
export function useSearchParamsHook(): URLParams & {
  handlePagination: (newPage: number) => void;
} {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const title = searchParams.get("title") || null;
  const status = searchParams.get("status") || null;
  const sortBy = (searchParams.get("sortBy") as URLParams["sortBy"]) ?? null;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const order = searchParams.get("order") as URLParams["order"];

  /**
   * Handles pagination by updating the `page` parameter in the URL.
   *
   * @param {number} newPage - The new page number to set.
   */
  const handlePagination = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());

    router.replace(`${pathname}?${params.toString()}`);
  };

  return { title, page, status, sortBy, order, handlePagination };
}
