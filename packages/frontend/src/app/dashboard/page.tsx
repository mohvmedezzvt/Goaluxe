"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Target,
  Calendar,
  BarChart3,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { EditGoalDialog } from "@/components/goals/edit-goal-dialog";
import {
  GoalsFilters,
  NoSearchResults,
} from "@/components/goals/goals-filters";
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
import { useDeleteGoal } from "@/hooks/use-delete-goal";
import { useSearchParamsHook } from "@/hooks/use-search-params";
import { useGoalsQuery } from "@/hooks/use-goals-query";
import { OverviewGoalCardSkeleton } from "@/components/skeleton/overview-goal-card";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
 * - `useGoalsQuery` to fetch goals data from the API.
 * - `useDeleteGoal` to handle goal deletion.
 * - `useEdit` to manage goal editing state.
 * - `useState` to manage local state for dialogs.
 *
 * The component is divided into several sections:
 * - Header Section: Displays a welcome message and a button to add a new goal.
 * - Quick Stats: Shows quick statistics about active goals, completed goals, overall progress, and upcoming deadlines.
 * - Main Content Grid: Contains the goals list and a sidebar with progress overview and upcoming deadlines.
 * - Dialogs: Includes dialogs for adding, editing, and deleting goals.
 */
export default function DashboardPage() {
  const { user } = useAuth(); // Get the authenticated user
  const { handleDeleteGoal, isDeleting } = useDeleteGoal(); // Hook for deleting goals
  const { isEditing, setEdit } = useEdit(); // Hook for managing edit state
  const [showAddDialog, setShowAddDialog] = useState(false); // State for controlling the Add Goal dialog

  // Extract query parameters for filtering and pagination
  const { title, page, status, sortBy, order, handlePagination } =
    useSearchParamsHook();

  // Fetch goals analytics using `react-query`

  const { data: analytics, isPending: loading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      return (await api.get<Analytics>("/analytics/dashboard")).data;
    },
  });

  // Fetch goals using `react-query`
  const { data: Goals, isPending } = useGoalsQuery({
    title,
    page,
    status,
    sortBy,
    order,
  });

  // Extract goals data from the response
  const goals = Goals?.data?.data || [];
  const totalPages = Goals?.data?.totalPages || 0;

  // Categorize goals into active and completed
  const activeGoals = analytics?.activeCount;
  const dueSoonGoals = analytics?.dueSoonGoals || [];
  const completedGoals = analytics?.completedCount || 0;

  // Calculate the average progress of all goals
  const averageProgress = analytics?.overallProgress || 0;

  const isDataEmpty = !isPending && !title && !status && goals.length === 0;
  const isSearchResultEmpty = (title || status) && goals.length === 0;
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      {/* Header Section */}
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

      {/* Quick Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            icon: <Target className="h-5 w-5 text-primary" />,
            label: "Active Goals",
            value: activeGoals,
            bgColor: "bg-primary/10",
          },
          {
            icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
            label: "Completed",
            value: completedGoals,
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
            value: dueSoonGoals.length,
            bgColor: "bg-orange-100 dark:bg-orange-900/20",
          },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-all">
            <CardContent className="p-4 sm:pt-6">
              <div className="flex gap-3">
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

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-6">
        {/* Goals List Section */}
        <div className="lg:col-span-4 space-y-6 flex flex-col items-center">
          <Card className="w-full">
            <CardHeader className="space-y-4 sm:space-y-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Goals</CardTitle>
                <GoalsFilters />
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="popLayout">
                <div className="space-y-4 h-[calc(100vh-32.5rem)] overflow-y-auto">
                  {!isPending ? (
                    goals.map((goal) => (
                      <GoalOverViewCard key={goal.id} {...goal} />
                    ))
                  ) : (
                    <OverviewGoalCardSkeleton />
                  )}

                  {/* Empty States */}
                  {isSearchResultEmpty && <NoSearchResults />}

                  {isDataEmpty && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full"
                    >
                      <Card className="flex justify-center items-center p-8 text-center bg-muted/50 h-full">
                        <div>
                          <Target className="w-8 h-8 mx-auto text-muted-foreground" />
                          <p className="mt-4 text-lg font-medium">
                            No goals yet
                          </p>
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
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </div>
              </AnimatePresence>
            </CardContent>
          </Card>
          {totalPages >= 2 && (
            <Pagination
              className="bg-default-100 rounded-2xl"
              total={totalPages || 0}
              page={page}
              initialPage={1}
              onChange={(page) => handlePagination(page)}
            />
          )}
        </div>

        {/* Sidebar Section */}
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
                    <span className="font-medium">{activeGoals}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium">{completedGoals}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin">
                {dueSoonGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{goal.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Due {new Date(goal.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Progress value={goal.progress} className="w-20 h-2" />
                  </div>
                ))}
                {dueSoonGoals?.length === 0 && (
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
