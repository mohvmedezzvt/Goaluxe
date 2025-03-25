"use client";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  Trophy,
  PlusIcon,
  Trash,
  Pencil,
  Target,
  DiamondMinus,
  Plus,
} from "lucide-react";
import { EllipsisVertical } from "lucide-react";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Pagination,
  Progress,
} from "@heroui/react";
import StatusTag from "@/components/goals/status-tag";
import {
  GoalDetailsSkeleton,
  SubtaskOverviewCardSkeleton,
} from "@/components/skeleton/detail-page";
import useDelete from "@/stores/useDelete";
import useEdit from "@/stores/useEdit";
import DeleteModal from "@/components/modals/delete-modal";
import { EditGoalModal } from "@/components/modals/edit-goal-modal";
import limitCharacters from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import SubtaskOverviewCard from "@/components/goals/subtask-overview-card";
import AddTaskModal from "@/components/modals/add-task-modal";
import { Filters, NoSearchResults } from "@/components/goals/filters";
import useGoalFilter from "@/stores/useGoalFilter";
import { useFetchQuery } from "@/hooks/use-fetch-query";
import { useSearchParams } from "@/hooks/use-search-params";
import SubtaskDetailsModal from "@/components/modals/subtask-details-modal";

/**
 * GoalDetailsPage component renders the details of a specific goal.
 * It includes information like title, description, progress, status, subtasks, and rewards.
 * Users can edit, delete, and manage subtasks related to the goal.
 */
const GoalDetailsPage = () => {
  const { id } = useParams(); // Extracts goal ID from the URL params
  const { setEditGoal, clearEdits } = useEdit(); // Handles editing a goal
  const { setDeleteGoal } = useDelete(); // Handles goal deletion
  const [isShowMore, setIsShowMore] = useState(false); // Toggle state for showing full description
  const [showAddTaskModal, setShowAddTaskModal] = useState(false); // Modal state for adding tasks

  // Fetch goal details
  const { data: goal, isPending: dataLoading } = useQuery({
    queryKey: ["goal", id],
    queryFn: async () => {
      return (await api.get<Goal>(`goals/${id}`)).data;
    },
    throwOnError: true,
  });

  // Filters and sorting state management
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

  // Extract query parameters for filtering and pagination
  const {
    title,
    page,
    status: statusParam,
    sortBy: sortByParam,
    order: orderParam,
    handlePagination,
  } = useSearchParams();

  // Fetch subtasks related to the goal
  const { data: subtasks, isPending: SubtasksLoading } = useFetchQuery<
    Subtask[]
  >({
    endpoint: `goals/${id}/subtasks`,
    params: {
      title: title ?? undefined,
      page: page ?? undefined,
      status: statusParam ?? undefined,
      sortBy: sortByParam ?? undefined,
      order: orderParam ?? undefined,
    },
    queryKey: [
      "subtasks",
      `goal-${id}`,
      title,
      page,
      statusParam,
      sortByParam,
      orderParam,
    ],
  });

  const subTasksData = useMemo(() => {
    const data = subtasks?.data?.data || [];
    const totalPages = subtasks?.data?.totalPages || 0;
    return { data, totalPages };
  }, [subtasks]);

  if (dataLoading) {
    return <GoalDetailsSkeleton />; // Show skeleton while loading goal data
  }

  const handleEditGoal = () => {
    clearEdits();
    setEditGoal(String(id));
  };

  // Renders the description section of a goal with a "show more/less" functionality
  const renderDescription = () => {
    if (!goal?.description) return null;
    if (goal.description.length <= 200)
      return <p className="text-gray-500">{goal.description}</p>;

    return (
      <div>
        <p className="text-gray-500">
          {isShowMore
            ? goal.description
            : limitCharacters({ str: goal.description, maxLength: 200 }) +
              "..."}
        </p>
        <p
          className="underline cursor-pointer"
          onClick={() => setIsShowMore((prev) => !prev)}
        >
          {isShowMore ? "Show less" : "Show more"}
        </p>
      </div>
    );
  };

  const isLoading = SubtasksLoading || dataLoading;
  const isDataEmpty =
    !isLoading && !title && !status && subtasks?.data?.data.length === 0;
  const isSearchResultEmpty =
    (title || status) && subtasks?.data?.data.length === 0;

  return (
    <div className=" animate-in fade-in duration-500 p-4">
      <div className="max-w-[1500px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Header Section */}
          <div className="col-span-full space-y-4">
            <div className="w-full flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="hover:bg-gray-100 dark:hover:bg-foreground-100 p-2 rounded-full transition-colors"
                  aria-label="Go back to dashboard"
                >
                  <ChevronLeft size={20} />
                </Link>
                <h2 className="text-2xl font-bold">{goal?.title}</h2>
              </div>
              <Dropdown placement="left">
                <DropdownTrigger
                  className="w-fit !min-w-0 !h-auto"
                  aria-label="More options"
                >
                  <Button
                    isIconOnly
                    className="bg-white dark:bg-black hover:bg-default-200 rounded-full transition-colors"
                    aria-label="More options"
                  >
                    <EllipsisVertical size={20} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu className="space-y-3">
                  {/* Edit Goal Option */}
                  <DropdownItem key="edit" onPress={handleEditGoal}>
                    <div className="flex text-foreground-800  items-center justify-between">
                      <p>Edit goal</p>
                      <Pencil size={17} />
                    </div>
                  </DropdownItem>

                  {/* Delete Goal Option */}
                  <DropdownItem
                    key="delete"
                    color="danger"
                    className="text-red-500"
                    onPress={() => setDeleteGoal(String(id))}
                  >
                    <div className="flex items-center justify-between group">
                      <p>Delete goal</p>
                      <Trash
                        size={17}
                        className="text-red-500 duration-500 group-hover:text-white"
                      />
                    </div>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            {/* Goal Description Section */}
            <div className="max-w-[60%] ml-5">{renderDescription()}</div>
          </div>

          {/* Progress Section */}
          <Card className="col-span-full lg:col-span-4 p-4 border shadow-sm">
            <CardHeader>
              <h3 className="text-lg font-semibold">Progress</h3>
            </CardHeader>
            <CardBody>
              <Progress
                value={goal?.progress}
                showValueLabel={true}
                label="Overall Completion"
                className="mt-2"
              />
            </CardBody>
          </Card>

          {/* Status Section */}
          <Card className="col-span-full lg:col-span-2 p-4 border shadow-sm">
            <CardHeader className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Status</h3>
              <StatusTag status={goal?.status || ""} />
            </CardHeader>
            <CardBody className="flex justify-between">
              <div className="flex items-center gap-8">
                <div className="space-y-1">
                  <p className="text-gray-500 text-sm">Created</p>
                  <p className="font-mono">
                    {new Date(goal?.createdAt || "").toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 text-sm">Due Date</p>
                  <p className="font-mono">
                    {new Date(goal?.dueDate || "").toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Sub-tasks Section */}
          <div className="col-span-full lg:col-span-4 row-span-2 flex flex-col items-center gap-6">
            <Card
              className=" p-4 border shadow-sm w-full  overflow-auto"
              shadow="none"
            >
              <CardHeader className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Sub-tasks</h3>
                <div className="flex items-center gap-2">
                  <Filters
                    status={status}
                    search={search}
                    setOrder={setOrder}
                    setSearch={setSearch}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    setStatus={setStatus}
                    order={order}
                    type="subtask"
                  />
                  <Button
                    className="flex items-center !min-w-8 !px-0 h-8  gap-2 bg-black text-white transition-colors"
                    aria-label="Add sub-task"
                    onPress={() => setShowAddTaskModal(true)}
                  >
                    <PlusIcon size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <AnimatePresence mode="popLayout">
                  <div className="overflow-y-auto h-[30rem] flex flex-col gap-4">
                    {/* Empty States */}
                    {isSearchResultEmpty && (
                      <NoSearchResults itemType="subTasks" />
                    )}
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
                            <DiamondMinus className="w-8 h-8 mx-auto text-muted-foreground" />
                            <p className="mt-4 text-lg font-medium">
                              No tasks yet
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Start by adding your first task!
                            </p>
                            <Button
                              // onPress={() => setShowAddDialog(true)}
                              className="mt-4 bg-black text-white"
                              onPress={() => setShowAddTaskModal(true)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Your First Task
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    )}

                    {subTasksData.data?.map((task) => (
                      <SubtaskOverviewCard key={task.id} {...task} />
                    ))}
                    {SubtasksLoading && <SubtaskOverviewCardSkeleton />}
                  </div>
                </AnimatePresence>
              </CardBody>
            </Card>
            {subTasksData.totalPages >= 2 && (
              <Pagination
                className="bg-default-100 rounded-2xl w-fit"
                total={subTasksData.totalPages || 0}
                page={page}
                initialPage={1}
                onChange={(page) => handlePagination(page)}
              />
            )}
          </div>

          {/* Reward Section */}
          <Card className="col-span-full lg:col-span-2 p-4 border shadow-sm">
            <CardHeader className="flex items-center gap-2">
              <Trophy className="text-yellow-500" />
              <h3 className="text-lg font-semibold">Reward</h3>
            </CardHeader>
            {goal?.reward ? (
              <CardBody className="space-y-4">
                <p className="text-gray-500">Complete this goal to earn:</p>
                <Card className="bg-gray-100 p-4 space-y-2" shadow="none">
                  <h4 className="text-lg font-semibold">Premium Access</h4>
                  <p className="text-gray-500">
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Rerum nobis.
                  </p>
                </Card>
              </CardBody>
            ) : (
              <CardBody className="border border-dashed rounded-xl flex flex-col items-center space-y-2 p-8 bg-default-100">
                <Target className="text-default-400" size={50} />
                <h4 className="text-lg font-semibold">No Reward Set</h4>
                <p className="text-gray-500 !mt-0">
                  No rewards set for this goal
                </p>
                <Button className="bg-black text-white">
                  <PlusIcon size={16} />
                  <span className="font-semibold">Set Reward</span>
                </Button>
              </CardBody>
            )}
          </Card>

          {/* Recent Activities Section
          <Card className="col-span-full lg:col-span-2 p-4 border shadow-sm">
            <CardHeader className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Recent Activities</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {[1, 2, 3].map((activity, index) => (
                <div key={index} className="flex gap-2">
                  <CheckCircle2 size={20} className="mt-1" />
                  <div className="space-y-2">
                    <p className="font-semibold">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    </p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card> */}
        </div>
      </div>
      <SubtaskDetailsModal />
      <EditGoalModal />
      <AddTaskModal
        open={showAddTaskModal}
        onOpenChange={setShowAddTaskModal}
        goalId={String(id)}
      />
      <DeleteModal />
    </div>
  );
};

export default GoalDetailsPage;
