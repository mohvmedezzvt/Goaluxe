import { api } from "@/lib/api";
import useDelete from "@/stores/useDelete";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Custom hook to handle deleting a goal.
 * Utilizes React Query for mutation and cache invalidation.
 *
 * @returns {Object} - Contains `handleDeleteGoal` function and `isDeleting` state.
 */
export function useDeleteGoal() {
  const queryClient = useQueryClient();
  const { isDeleting, setDelete } = useDelete();

  /**
   * Mutation for deleting a goal.
   *
   * - Uses the goal ID from `isDeleting` state.
   * - Calls API to delete the goal.
   * - Invalidates queries to refresh goal-related data.
   */
  const mutation = useMutation({
    mutationKey: [`Goal-delete-${isDeleting}`],
    mutationFn: async (deletingGoal: string) =>
      api.delete(`goals/${deletingGoal}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Goals"] });
      queryClient.invalidateQueries({ queryKey: ["GoalsPage"] });
    },
  });

  /**
   * Triggers the delete mutation if there is a goal set to be deleted.
   * Resets the `isDeleting` state after deletion.
   */
  const handleDeleteGoal = async () => {
    if (isDeleting) {
      mutation.mutate(isDeleting);
      setDelete(null);
    }
  };

  return { handleDeleteGoal, isDeleting };
}
