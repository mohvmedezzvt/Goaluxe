"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { EditGoalDialog } from "@/components/goals/edit-goal-dialog";
import { Loading } from "@/components/ui/loading";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import GoalDetailedCard from "@/components/goals/goal-detailed-card";
import useEdit from "@/stores/useEdit";
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
import { useDeleteGoal } from "@/hooks/use-delete-goal";

/**
 * GoalsPage component renders a dashboard displaying a list of goals.
 *
 * ## Features:
 * - Fetches and displays goals from an API.
 * - Supports adding, editing, and deleting goals.
 * - Uses dialogs for user interactions.
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
 * ```
 *
 * @remarks
 * - Uses `useState` for dialog state management.
 * - Uses `useQuery` from React Query for data fetching.
 * - Displays `Loading` while data is being fetched.
 * - Handles goal modifications via `AddGoalDialog` and `EditGoalDialog`.
 *
 * @see {@link https://react-query.tanstack.com/reference/useQuery | useQuery}
 * @see {@link https://reactjs.org/docs/hooks-state.html | useState}
 */
export default function GoalsPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { isEditing, setEdit } = useEdit();
  const { handleDeleteGoal, isDeleting } = useDeleteGoal();

  // Fetch goals data
  const { data: response, isPending } = useQuery({
    queryKey: ["GoalsPage"],
    queryFn: () =>
      api.get<{
        data: Goal[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>("/goals?limit=20"),
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

      <AlertDialog open={!!isDeleting}>
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
              onClick={() => isDeleting && handleDeleteGoal}
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
