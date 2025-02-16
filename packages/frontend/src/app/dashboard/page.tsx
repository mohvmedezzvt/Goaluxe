"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Target,
  Search,
  Calendar,
  BarChart3,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { EditGoalDialog } from "@/components/goals/edit-goal-dialog";
import { GoalsFilters } from "@/components/goals/goals-filters";
import { motion, AnimatePresence } from "framer-motion";
import { Pagination } from "@heroui/pagination";
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
import { cn } from "@/lib/utils";
import useEdit from "@/stores/useEdit";
import GoalOverViewCard from "@/components/goals/goal-overview-card";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import useDelete from "@/stores/useDelete";
import { GoalsLoading } from "@/components/goals/goals-loading";

/**
 * DashboardPage component is the main dashboard view for the application.
 * It displays an overview of the user's goals, including active, completed, and upcoming goals.
 * It also provides functionalities to add, edit, and delete goals.
 *
 * @component
 * @returns {JSX.Element} The rendered DashboardPage component.
 *
 * @example
 * ```tsx
 * import DashboardPage from './path/to/DashboardPage';
 *
 * function App() {
 *   return <DashboardPage />;
 * }
 * ```
 *
 * @remarks
 * This component uses several hooks and components from the application:
 * - `useAuth` to get the current user.
 * - `useSearchParams` to get query parameters from the URL.
 * - `useQuery` to fetch goals data from the API.
 * - `useDelete` and `useMutation` to handle goal deletion.
 * - `useEdit` to manage goal editing state.
 * - `useState` to manage local state for dialogs.
 * - `useQueryClient` to manage query caching and invalidation.
 *
 * The component is divided into several sections:
 * - Header Section: Displays a welcome message and a button to add a new goal.
 * - Quick Stats: Shows quick statistics about active goals, completed goals, overall progress, and upcoming deadlines.
 * - Main Content Grid: Contains the goals list and a sidebar with progress overview and upcoming deadlines.
 * - Dialogs: Includes dialogs for adding, editing, and deleting goals.
 *
 * @hook
 * @function useAuth
 * @function useSearchParams
 * @function useQuery
 * @function useDelete
 * @function useMutation
 * @function useEdit
 * @function useState
 * @function useQueryClient
 *
 * @typedef {Object} Goal
 * @property {string} id - The unique identifier of the goal.
 * @property {string} title - The title of the goal.
 * @property {string} description - The description of the goal.
 * @property {string} status - The status of the goal (e.g., "active", "completed").
 * @property {Date} createdAt - The creation date of the goal.
 * @property {Date} dueDate - The due date of the goal.
 * @property {number} progress - The progress percentage of the goal.
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const title = searchParams.get("title") || undefined;

  const queryClient = useQueryClient();
  const { data: response, isPending } = useQuery({
    queryKey: ["Goals", title],
    queryFn: () =>
      api.get<Goal[]>(`/goals?title=${encodeURIComponent(title ?? "")}`),
    placeholderData: keepPreviousData,
    retry: 10,
    retryDelay: 2000,
  });

  const { isDeleting, setDelete } = useDelete();
  const { isEditing, setEdit } = useEdit();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const mutation = useMutation({
    mutationKey: [`Goal-delete-${isDeleting}`],
    mutationFn: async (deletingGoal: string) => {
      return await api.delete(`goals/${deletingGoal}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Goals"] });
    },
  });

  const goals = response?.data || [];
  const activeGoals = goals.filter((goal) => goal.status === "active");
  const completedGoals = goals.filter((goal) => goal.status === "completed");
  const averageProgress =
    goals.length > 0
      ? goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length
      : 0;

  const handleDeleteGoal = async () => {
    if (isDeleting) {
      mutation.mutate(isDeleting);
      setDelete(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header Section - Improved mobile layout */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.username}!
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track and manage your goals effectively
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          size="lg"
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Goal
        </Button>
      </div>

      {/* Quick Stats - Better mobile grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            icon: <Target className="h-5 w-5 text-primary" />,
            label: "Active Goals",
            value: activeGoals.length,
            bgColor: "bg-primary/10",
          },
          {
            icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
            label: "Completed",
            value: completedGoals.length,
            bgColor: "bg-green-100 dark:bg-green-900/20",
          },
          {
            icon: <ArrowUpRight className="h-5 w-5 text-blue-600" />,
            label: "Progress",
            value: `${averageProgress.toFixed(0)}%`,
            bgColor: "bg-blue-100 dark:bg-blue-900/20",
          },
          {
            icon: <Clock className="h-5 w-5 text-orange-600" />,
            label: "Due Soon",
            value: activeGoals.filter((g) => {
              const daysLeft = Math.ceil(
                (new Date(g.dueDate).getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              return daysLeft <= 7 && daysLeft > 0;
            }).length,
            bgColor: "bg-orange-100 dark:bg-orange-900/20",
          },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-all">
            <CardContent className="p-4 sm:pt-6">
              <div className="flex  gap-3">
                <div className={cn("h-fit p-2 rounded-lg", stat.bgColor)}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Main Content Grid - Responsive layout */}
      <div className="grid gap-6 lg:grid-cols-6">
        {/* Goals List Section */}
        <div className="lg:col-span-4 space-y-6 flex flex-col items-center">
          <Card className="w-full">
            <CardHeader className="space-y-4 sm:space-y-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Goals Overview</CardTitle>
                <GoalsFilters />
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="popLayout">
                <div className="space-y-4  max-h-[calc(100vh-32.5rem)] overflow-y-auto">
                  {!isPending ? (
                    goals.map(
                      ({
                        title,
                        description,
                        createdAt,
                        id,
                        status,
                        dueDate,
                        progress,
                      }) => (
                        <GoalOverViewCard
                          key={id}
                          title={title}
                          description={description}
                          createdAt={createdAt}
                          id={id}
                          status={status}
                          dueDate={dueDate}
                          progress={progress}
                        />
                      )
                    )
                  ) : (
                    <GoalsLoading />
                  )}

                  {/* Empty States - Centered on mobile */}
                  {title && goals?.length == 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Card className="p-6 sm:p-8 text-center bg-muted/50">
                        <Search className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="mt-4 text-lg font-medium">
                          No matching goals
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Try adjusting your search or filters
                        </p>
                      </Card>
                    </motion.div>
                  )}

                  {!isPending && !title && goals.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Card className="p-8 text-center bg-muted/50">
                        <Target className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="mt-4 text-lg font-medium">No goals yet</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Start by adding your first goal!
                        </p>
                        <Button
                          onClick={() => setShowAddDialog(true)}
                          className="mt-4"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Goal
                        </Button>
                      </Card>
                    </motion.div>
                  )}
                </div>
              </AnimatePresence>
            </CardContent>
          </Card>
          <Pagination
            className="bg-default-200 rounded-2xl"
            total={10}
            initialPage={1}
          />
        </div>

        {/* Sidebar - Horizontal scroll on mobile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Overall Progress
                    </span>
                    <span>{averageProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={averageProgress} className="h-2" />
                </div>
                <div className="pt-4 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Goals</span>
                    <span className="font-medium">{activeGoals.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium">{completedGoals.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines - Scrollable on mobile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin">
                {activeGoals
                  .sort(
                    (a, b) =>
                      new Date(a.dueDate).getTime() -
                      new Date(b.dueDate).getTime()
                  )
                  .slice(0, 3)
                  .map(({ title, id, dueDate, progress }) => (
                    <div key={id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{title}</p>
                        <p className="text-sm text-muted-foreground">
                          Due {new Date(dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Progress value={progress} className="w-20 h-2" />
                    </div>
                  ))}
                {activeGoals.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming deadlines
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
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
              onClick={handleDeleteGoal}
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
