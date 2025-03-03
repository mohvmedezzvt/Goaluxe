import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useOptimisticUpdate<TData>({
  mutationFn,
  queryKey,
}: {
  mutationFn: (data: TData) => Promise<any>;
  queryKey: string[];
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    // When mutate is called:
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey) as
        | TData
        | undefined;

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, newData);

      // Return a context with the previous and new data
      return { previousData, newData };
    },
    // If the mutation fails, use the context we returned above
    onError: (error, variables, context) => {
      queryClient.setQueryData<TData>(queryKey, context?.previousData);
    },
    // Always refetch after error or success:
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      console.log({ queryKey });
    },
  });
}
