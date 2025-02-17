import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useGoalsQuery({ title, page, status, key }: URLParams) {
  const queryFn = () => {
    const queryParams = new URLSearchParams();

    if (title) queryParams.append("title", title);
    if (page > 1) queryParams.append("page", page.toString());
    if (status && status !== "all") queryParams.append("status", status);
    if (key) queryParams.append("key", key);

    return api.get<{
      data: Goal[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/goals${queryParams.toString() ? `?${queryParams.toString()}` : ""}`);
  };

  return useQuery({
    queryKey: ["Goals", title, page, status, key],
    queryFn,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
