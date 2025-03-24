"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSearchParams } from "@/hooks/use-search-params";
import { useFetchQuery } from "@/hooks/use-fetch-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardBody, CardHeader, Button, Pagination } from "@heroui/react";
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
import { AddGoalModal } from "@/components/modals/add-goal-modal";
import { Filters, NoSearchResults } from "@/components/goals/goals-filters";
import GoalOverviewCard from "@/components/goals/goal-overview-card";
import {
  QuickStatusCardSkeleton,
  ProgressOverviewSkeleton,
  UpcomingDeadline,
} from "@/components/skeleton/quick-status";
import { OverviewGoalCardSkeleton } from "@/components/skeleton/overview-goal-card";
import useGoalFilter from "@/stores/useGoalFilter";

/**
 * DashboardPage Component
 *
 * The main dashboard view for the application. It displays an overview of the user's goals,
 * including active, completed, and upcoming goals. It also provides functionalities to add,
 * edit, and delete goals.
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
 * - `useQuery` to fetch analytics data.
 * - `useState` to manage local state for dialogs.
 *
 * The component is divided into several sections:
 * - Header Section: Displays a welcome message and a button to add a new goal.
 * - Quick Stats: Shows quick statistics about active goals, completed goals, overall progress, and upcoming deadlines.
 * - Main Content Grid: Contains the goals list and a sidebar with progress overview and upcoming deadlines.
 * - Dialogs: Includes dialogs for adding goals.
 */
export default function DashboardPage() {
  const { user } = useAuth(); // Get the authenticated user
  const [showAddDialog, setShowAddDialog] = useState(false); // State for controlling the Add Goal dialog

  // Extract query parameters for filtering and pagination
  const {
    title,
    page,
    status: statusParam,
    sortBy: sortByParam,
    order: orderParam,
    handlePagination,
  } = useSearchParams();

  // Fetch goals analytics using `react-query`
  const { data: analytics, isPending: loadingAnalytics } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      return (await api.get<Analytics>("/analytics/dashboard")).data;
    },
  });

  const {
    status,
    setStatus,
    sortBy,
    setSortBy,
    search,
    setSearch,
    order,
    setOrder,
  } = useGoalFilter();

  // Fetch goals using `react-query`
  const { data: Goals, isPending: loadingGoals } = useFetchQuery<Goal[]>({
    endpoint: "/goals",
    params: {
      title: title ?? undefined,
      page: page ?? undefined,
      status: statusParam ?? undefined,
      sortBy: sortByParam ?? undefined,
      order: orderParam ?? undefined,
    },
    queryKey: ["Goals", title, page, statusParam, sortByParam, orderParam],
  });

  // Extract goals data from the response
  const goals = useMemo(() => Goals?.data?.data || [], [Goals]);

  const totalPages = useMemo(() => Goals?.data?.totalPages || 0, [Goals]);

  // Categorize goals into active and completed

  const analyticsData = useMemo(() => {
    const activeGoals = analytics?.activeCount || 0;
    const dueSoonGoals = analytics?.dueSoonTasks || [];
    const completedGoals = analytics?.completedCount || 0;
    const dueSoonCount = analytics?.dueSoonCount || 0;
    const averageProgress = analytics?.overallProgress || 0;

    return {
      activeGoals,
      dueSoonGoals,
      completedGoals,
      dueSoonCount,
      averageProgress,
    };
  }, [analytics]);

  const isLoading = loadingAnalytics || loadingGoals;
  const isDataEmpty = !isLoading && !title && !status && goals.length === 0;
  const isSearchResultEmpty = (title || status) && goals.length === 0;

  // Memoized analytics data for quick stats
  const memoizedAnalytics = useMemo(
    () => [
      {
        icon: <Target className="h-5 w-5 text-primary" />,
        label: "Active Goals",
        value: analyticsData.activeGoals,
        bgColor: "bg-primary/10",
      },
      {
        icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
        label: "Completed",
        value: analyticsData.completedGoals,
        bgColor: "bg-green-100 dark:bg-green-900/20",
      },
      {
        icon: <ArrowUpRight className="h-5 w-5 text-blue-600" />,
        label: "Progress",
        value: `${analyticsData.averageProgress.toFixed(0)}%`,
        bgColor: "bg-blue-100 dark:bg-blue-900/20",
      },
      {
        icon: <Clock className="h-5 w-5 text-orange-600" />,
        label: "Due Soon Goals",
        value: analyticsData.dueSoonCount,
        bgColor: "bg-orange-100 dark:bg-orange-900/20",
      },
    ],
    [analyticsData]
  );

  return (
    <div className="grid grid-cols-6 gap-6 animate-in fade-in duration-500 max-w-[1500px] mx-auto">
      {/* Header Section */}
      <div className="col-span-full flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.username}!
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track and manage your goals effectively
          </p>
        </div>
        <Button
          onPress={() => setShowAddDialog(true)}
          size="lg"
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Goal
        </Button>
      </div>

      {/* Quick Stats Section */}
      <div className="col-span-full flex flex-col lg:flex-row items-center justify-between gap-6">
        {loadingAnalytics
          ? Array.from({ length: 4 }, (_, index) => (
              <QuickStatusCardSkeleton key={`analytic-skeleton-${index}`} />
            ))
          : memoizedAnalytics.map((stat, i) => (
              <Card
                key={i}
                className="hover:shadow-md border transition-all w-[25%]"
                shadow="none"
              >
                <CardBody className="p-4 sm:pt-6">
                  <div className="flex gap-3">
                    <div className={cn("h-fit p-2 rounded-lg", stat.bgColor)}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
      </div>

      {/* Goals List Section */}
      <div className="lg:col-span-4 row-span-4 flex flex-col items-center gap-6">
        <Card className="w-full border p-4" shadow="none">
          <CardHeader className="space-y-4 sm:space-y-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
              <h3 className="font-bold text-xl">Goals</h3>
              <Filters
                status={status}
                search={search}
                setOrder={setOrder}
                setSearch={setSearch}
                sortBy={sortBy}
                setSortBy={setSortBy}
                setStatus={setStatus}
                order={order}
                type="goal"
              />
            </div>
          </CardHeader>
          <CardBody>
            <AnimatePresence mode="popLayout">
              <div className="space-y-4 h-[34rem] overflow-y-auto">
                {!loadingGoals ? (
                  goals.map((goal) => (
                    <GoalOverviewCard key={goal.id} {...goal} />
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
                    <Card
                      className="flex justify-center items-center p-8 text-center bg-muted/50 h-full border border-dashed"
                      shadow="none"
                    >
                      <div>
                        <Target className="w-8 h-8 mx-auto text-muted-foreground" />
                        <p className="mt-4 text-lg font-medium">No goals yet</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Start by adding your first goal!
                        </p>
                        <Button
                          onPress={() => setShowAddDialog(true)}
                          className="mt-4 bg-black text-white"
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
          </CardBody>
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

      {/* Progress Overview */}
      {loadingAnalytics ? (
        <ProgressOverviewSkeleton />
      ) : (
        <Card className="col-span-2 border p-4" shadow="none">
          <CardHeader>
            <div className="flex items-center gap-2 font-bold text-md">
              <BarChart3 className="h-5 w-5" />
              Progress Overview
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Overall Progress
                  </span>
                  <span>{analyticsData.averageProgress.toFixed(0)}%</span>
                </div>
                <Progress
                  value={analyticsData.averageProgress}
                  className="h-2"
                />
              </div>
              <div className="pt-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Goals</span>
                  <span className="font-medium">
                    {analyticsData.activeGoals}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium">
                    {analyticsData.completedGoals}
                  </span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Upcoming Deadlines */}
      {loadingAnalytics ? (
        <UpcomingDeadline />
      ) : (
        <Card className="col-span-2 row-span-2 border p-4" shadow="none">
          <CardHeader>
            <div className="flex items-center gap-2 font-bold text-md">
              <Calendar className="h-5 w-5" />
              Upcoming Subtasks
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin">
              {analyticsData.dueSoonGoals.map((goal) => (
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
              {analyticsData.dueSoonGoals?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming Subtasks
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Dialogs */}
      <AddGoalModal open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}
