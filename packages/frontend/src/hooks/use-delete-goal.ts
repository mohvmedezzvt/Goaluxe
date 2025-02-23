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
  const { isDeleting, setDelete } = useDelete();
  const router = useRouter();
  /**
   * Mutation for deleting a goal.
   *
   * - Uses the goal ID from `isDeleting` state.
   * - Calls API to delete the goal.
   * - Invalidates queries to refresh goal-related data.
   */
  const { mutate, isPending: deleteLoading } = useMutation({
    mutationKey: [`Goal-delete-${isDeleting}`],
    mutationFn: async (deletingGoal: string) =>
      api.delete(`goals/${deletingGoal}`),
    onSuccess: () => {
      setDelete(null); // Only close modal after successful deletion
      router.push("/dashboard");
      queryClient.invalidateQueries({ queryKey: ["Goals"] });
    },
  });

  /**
   * Triggers the delete mutation if there is a goal set to be deleted.
   * Resets the `isDeleting` state after deletion.
   */
  const handleDeleteGoal = async () => {
    if (isDeleting) {
      mutate(isDeleting);
    }
  };

  return { handleDeleteGoal, deleteLoading };
}
