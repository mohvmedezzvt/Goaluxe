import { api } from "@/lib/api";
import useDelete from "@/stores/useDelete";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

/**
 * Custom hook to handle deleting a goal.
 * Utilizes React Query for mutation and cache invalidation.
 *
 * @returns {Object} - Contains `handleDeleteGoal` function and `isDeleting` state.
 */
export function useDeleteGoal() {
  const queryClient = useQueryClient();
  const { isDeleting, clearDeletes } = useDelete();
  const router = useRouter();
  const deletePath = isDeleting.goal?.goalId
    ? `goals/${isDeleting.goal.goalId}` // Goal deletion
    : `goals/${isDeleting.subtask?.goalId}/subtasks/${isDeleting.subtask?.subtaskId}`; // Subtask deletion

  const mutationKey = [
    `${isDeleting.goal?.goalId ? `Goal-${isDeleting.goal.goalId}` : `subtask-goal-${isDeleting.subtask?.goalId}`}-delete-${isDeleting.subtask?.subtaskId}`,
  ];

  const invalidateKey = isDeleting.goal?.goalId ? [`Goals`] : [`subtasks`];

  /**
   * Mutation for deleting a goal.
   *
   * - Uses the goal ID from `isDeleting` state.
   * - Calls API to delete the goal.
   * - Invalidates queries to refresh goal-related data.
   */
  const { mutate, isPending: deleteLoading } = useMutation({
    mutationKey: mutationKey,
    mutationFn: async () => api.delete(deletePath),
    onSuccess: () => {
      if (isDeleting.goal?.goalId) {
        router.push("/dashboard");
      }
      queryClient.invalidateQueries({ queryKey: invalidateKey });
    },
    onSettled: () => {
      clearDeletes();
    },
  });

  /**
   * Triggers the delete mutation if there is a goal set to be deleted.
   * Resets the `isDeleting` state after deletion.
   */
  const handleDelete = async () => {
    mutate();
  };

  return { handleDelete, deleteLoading };
}
