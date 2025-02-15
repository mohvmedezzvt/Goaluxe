"use client";

import { useState, useEffect } from "react";
import { useGoals } from "@/hooks/use-goals";
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
import { Loading } from "@/components/ui/loading";
import { GoalsFilters } from "@/components/goals/goals-filters";
import { motion, AnimatePresence } from "framer-motion";
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

export default function DashboardPage() {
  const { user } = useAuth();
  const { goals, loading, deleteGoal } = useGoals();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { isEditing, setEdit } = useEdit();
  const [deletingGoal, setDeletingGoal] = useState<string | null>(null);
  const [filteredGoals, setFilteredGoals] = useState(goals);

  console.log(goals);
  useEffect(() => {
    setFilteredGoals(goals);
  }, [goals]);

  if (loading) {
    return <Loading />;
  }

  const activeGoals = goals.filter((goal) => goal.status === "active");
  const completedGoals = goals.filter((goal) => goal.status === "completed");
  const averageProgress = Number.isNaN(goals.length)
    ? goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length
    : 0;

  const handleDeleteGoal = async () => {
    if (deletingGoal) {
      await deleteGoal(deletingGoal);
      setDeletingGoal(null);
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
                (new Date(g.targetDate).getTime() - new Date().getTime()) /
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
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="space-y-4 sm:space-y-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Goals Overview</CardTitle>
                <GoalsFilters
                  goals={goals}
                  onFilterChange={setFilteredGoals}
                  onSortChange={setFilteredGoals}
                />
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="popLayout">
                <div className="space-y-4">
                  {filteredGoals.map(
                    (
                      {
                        title,
                        description,
                        createdAt,
                        id,
                        status,
                        targetDate,
                        progress,
                      },
                      index
                    ) => (
                      <GoalOverViewCard
                        key={index}
                        title={title}
                        description={description}
                        createdAt={createdAt}
                        id={id}
                        status={status}
                        targetDate={targetDate}
                        progress={progress}
                      />
                    )
                  )}

                  {/* Empty States - Centered on mobile */}
                  {filteredGoals.length === 0 && goals.length > 0 && (
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

                  {goals.length === 0 && (
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
                      new Date(a.targetDate).getTime() -
                      new Date(b.targetDate).getTime()
                  )
                  .slice(0, 3)
                  .map((goal, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{goal.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Due {new Date(goal.targetDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Progress value={goal.progress} className="w-20 h-2" />
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
        open={!!deletingGoal}
        onOpenChange={() => setDeletingGoal(null)}
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
