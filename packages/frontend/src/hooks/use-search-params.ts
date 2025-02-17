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
  const title = searchParams.get("title") || undefined;
  const status = searchParams.get("status") || undefined;
  const key = (searchParams.get("key") as URLParams["key"]) ?? undefined;
  const page = Number(searchParams.get("page")) || 1;

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

  return { title, page, status, key, handlePagination };
}
