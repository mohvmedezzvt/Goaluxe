"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { EditGoalDialog } from "@/components/goals/edit-goal-dialog";
import { Loading } from "@/components/ui/loading";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import GoalDetailedCard from "@/components/goals/goal-detailed-card";
import useEdit from "@/stores/useEdit";
import useDelete from "@/stores/useDelete";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * GoalsPage component renders a dashboard page displaying a list of goals.
 *
 * This component uses the `useQuery` hook to fetch goals data from the API and displays
 * them in a grid layout. Each goal is displayed in a card with options to edit or delete the goal.
 *
 * The component also includes functionality to add a new goal and edit an existing goal using dialogs.
 *
 * @component
 * @returns {JSX.Element} The rendered GoalsPage component.
 *
 * @example
 * ```tsx
 * import GoalsPage from './path/to/GoalsPage';
 *
 * function App() {
 *   return (
 *     <div>
 *       <GoalsPage />
 *     </div>
 *   );
 * }
 *
 * export default App;
 * ```
 *
 * @remarks
 * - The component uses `useState` to manage the state of the add goal dialog and the editing goal.
 * - The `useQuery` hook is used to fetch the goals data from the API.
 * - The `Loading` component is displayed while the data is being fetched.
 * - The `AddGoalDialog` and `EditGoalDialog` components are used to handle adding and editing goals respectively.
 *
 * @see {@link https://react-query.tanstack.com/reference/useQuery | useQuery}
 * @see {@link https://reactjs.org/docs/hooks-state.html | useState}
 */
/**
 * GoalsPage component renders the main dashboard page for managing goals.
 * It fetches the list of goals, displays them, and provides functionalities
 * to add, edit, and delete goals.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 *
 * @example
 * <GoalsPage />
 *
 * @remarks
 * This component uses React Query for data fetching and mutation, and
 * manages local state for dialog visibility.
 *
 * @function
 * @name GoalsPage
 *
 * @hook
 * @name useState
 * @description Manages the state for showing the Add Goal dialog.
 *
 * @hook
 * @name useEdit
 * @description Custom hook to manage the editing state of a goal.
 *
 * @hook
 * @name useDelete
 * @description Custom hook to manage the deleting state of a goal.
 *
 * @hook
 * @name useQueryClient
 * @description Provides access to the React Query client.
 *
 * @hook
 * @name useQuery
 * @description Fetches the list of goals from the API.
 *
 * @hook
 * @name useMutation
 * @description Handles the deletion of a goal.
 *
 * @param {boolean} showAddDialog - State to control the visibility of the Add Goal dialog.
 * @param {Function} setShowAddDialog - Function to set the state of showAddDialog.
 * @param {boolean} isEditing - State to control the editing mode of a goal.
 * @param {Function} setEdit - Function to set the state of isEditing.
 * @param {boolean} isDeleting - State to control the deletion mode of a goal.
 * @param {Function} setDelete - Function to set the state of isDeleting.
 * @param {Object} queryClient - React Query client for managing query cache.
 * @param {Object} response - Response object containing the list of goals.
 * @param {boolean} isPending - State to indicate if the query is in a loading state.
 * @param {Array} goals - Array of goal objects fetched from the API.
 * @param {Object} mutation - Mutation object for handling goal deletion.
 *
 * @returns {JSX.Element} The rendered GoalsPage component.
 */
export default function GoalsPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { isEditing, setEdit } = useEdit();
  const { isDeleting, setDelete } = useDelete();

  const queryClient = useQueryClient();

  const { data: response, isPending } = useQuery({
    queryKey: ["Goals"],
    queryFn: () =>
      api.get<{
        data: Goal[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>("/goals"),
  });

  const mutation = useMutation({
    mutationKey: [`Goal-delete-${isDeleting}`],
    mutationFn: async (deletingGoal: string) => {
      return await api.delete(`goals/${deletingGoal}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Goals"] });
    },
  });

  const goals = response?.data?.data;

  if (isPending) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Goals</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals?.map(
          ({
            id,
            title,
            description,
            dueDate,
            progress,
            status,
            createdAt,
          }) => (
            <GoalDetailedCard
              key={id}
              id={id}
              title={title}
              description={description}
              dueDate={dueDate}
              progress={progress}
              status={status}
              createdAt={createdAt}
            />
          )
        )}
      </div>

      <AddGoalDialog open={showAddDialog} onOpenChange={setShowAddDialog} />

      {isEditing && (
        <EditGoalDialog
          goalId={isEditing}
          open={true}
          onOpenChange={() => setEdit(null)}
        />
      )}

      <AlertDialog
        open={!!isDeleting && !mutation.isPending}
        onOpenChange={() => setDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              goal and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => isDeleting && mutation.mutate(isDeleting)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
