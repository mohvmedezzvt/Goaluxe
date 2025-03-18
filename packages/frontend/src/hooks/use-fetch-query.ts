import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useFetchQuery<T>({
  endpoint,
  params,
  queryKey,
}: {
  endpoint: string;
  params?: Record<string, string | number | undefined>;
  queryKey: unknown[]; // Unique query key for caching
}) {
  const router = useRouter();

  const queryFn = async () => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }

    const response = await api.get<{ data: T; totalPages: number }>(
      `${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );

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
    queryKey: [endpoint, ...queryKey],
    queryFn,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    throwOnError: true,
  });
}
