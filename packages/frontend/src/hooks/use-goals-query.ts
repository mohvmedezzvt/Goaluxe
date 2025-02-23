import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useGoalsQuery({
  title,
  page,
  status,
  sortBy,
  order,
}: URLParams) {
  const router = useRouter();
  const queryFn = async () => {
    const queryParams = new URLSearchParams();

    if (title) queryParams.append("title", title);
    if (page > 1) queryParams.append("page", page.toString());
    if (status && status !== "all") queryParams.append("status", status);
    if (sortBy) queryParams.append("sortBy", sortBy);
    if (order) queryParams.append("order", order);

    const response = await api.get<{
      data: Goal[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/goals${queryParams.toString() ? `?${queryParams.toString()}` : ""}`);

    // Check if the current page exceeds totalPages
    if (
      response?.data &&
      page > response.data.totalPages &&
      response.data.totalPages > 0
    ) {
      // Redirect to the last available page
      router.replace(`?page=1`);
    }

    return response;
  };

  return useQuery({
    queryKey: ["Goals", title, page, status, sortBy, order],
    queryFn,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    throwOnError: true,
  });
}
