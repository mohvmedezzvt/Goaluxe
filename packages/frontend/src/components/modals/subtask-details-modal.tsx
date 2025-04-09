"use client";

import React, { useCallback, useEffect, useState } from "react";
import useDueDate from "@/hooks/useDueDate";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import useEdit from "@/stores/useEdit";
import useDelete from "@/stores/useDelete";
import {
  Button,
  Card,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Skeleton,
} from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Calendar, CheckCircle } from "lucide-react";
import StatusTag from "../goals/status-tag";
import EditTaskModal from "./edit-task-modal";

/**
 * Component: SubtaskDetailsModal
 *
 * Displays a modal that allows users to view detailed information about a selected subtask,
 * edit the subtask, update its status (pending, in-progress, completed), or delete it.
 *
 * Features:
 * - Fetches subtask data from the API dynamically using React Query.
 * - Visualizes due date status using a custom hook (`useDueDate`).
 * - Enables status update via mutation and auto-invalidation of cache.
 * - Connects to global stores (`useEdit`, `useDelete`) for centralized subtask management.
 */
const SubtaskDetailsModal = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState<boolean>(false); // State for controlling the edit modal
  const { setDeleteSubtask } = useDelete(); // Store function to mark a subtask for deletion
  const { isEditing, clearEdits } = useEdit(); // Editing state from global store
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state for mutation

  /**
   * Query: Fetch subtask details from API
   *
   * Runs only if `isEditing.subtask` exists.
   * Used to populate the modal with the current subtask’s data.
   */
  const { data, isPending } = useQuery({
    queryKey: [
      `subtask-${isEditing.subtask?.subtaskId}`,
      `goal-${isEditing.subtask?.goalId}`,
    ],
    queryFn: async () => {
      return (
        await api.get<Subtask>(
          `/goals/${isEditing.subtask?.goalId}/subtasks/${isEditing.subtask?.subtaskId}`
        )
      ).data;
    },
    enabled: !!isEditing.subtask,
  });

  // Extract due date insights using a custom hook
  const { formattedDate, daysDue, isOverdue, daysOverdue, isDueToday } =
    useDueDate(data?.dueDate as string);

  // Maintain local status state for optimistic UI updates
  const [localStatus, setLocalStatus] = useState<string>(
    data?.status as string
  );

  // Sync status if subtask data changes
  useEffect(() => {
    setLocalStatus(data?.status as string);
  }, [data?.status]);

  /**
   * Mutation: Update subtask status (e.g., mark as completed or in-progress)
   *
   * Automatically invalidates:
   * - Goal subtasks list
   * - Goal details
   * - Goals list
   * - This subtask's own query
   */
  const { mutate } = useMutation({
    mutationKey: [
      "subtask",
      data?.id,
      `goal-${data?.goal}`,
      `mark-as-${localStatus}`,
    ],
    mutationFn: async (newStatus: string) => {
      return await api.patch(`/goals/${data?.goal}/subtasks/${data?.id}`, {
        status: newStatus,
      });
    },
    onMutate: () => setIsLoading(true),
   onSuccess:()=>{
    queryClient.invalidateQueries({
      queryKey: ["subtasks", `goal-${data?.goal}`],
    });
    queryClient.invalidateQueries({
      queryKey: ["Goals"],
    });
    queryClient.invalidateQueries({
      queryKey: ["goal", data?.goal],
      exact: true,
    });
    queryClient.invalidateQueries({
      queryKey: [`subtask-${data?.id}`, `goal-${data?.goal}`],
      exact: true,
    });
   },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  /**
   * Trigger deletion logic via global state.
   */
  const handleDelete = useCallback(() => {
    if (data?.id && data?.goal) {
      setDeleteSubtask(data.id, data.goal);
    }
  }, [data, setDeleteSubtask]);

  /**
   * Cycles subtask status through:
   *   "pending" → "in-progress" → "completed" → "pending"
   */
  const handleMarkAs = async () => {
    const newStatus =
      localStatus === "pending"
        ? "in-progress"
        : localStatus === "completed"
          ? "pending"
          : "completed";

    mutate(newStatus);
    setLocalStatus(newStatus);
  };

  // Visual styling based on subtask status or overdue state
  const borderTopColor =
    localStatus === "pending"
      ? "border-yellow-400"
      : localStatus === "in-progress"
        ? "border-green-400"
        : localStatus === "completed"
          ? "border-blue-400"
          : isOverdue
            ? "border-red-800"
            : "";

  return (
    <>
      {/* Main Modal - View Subtask */}
      <Modal
        backdrop="blur"
        className={cn(
          "pt-4 border-t-8 duration-500",
          borderTopColor,
          isLoading && "pointer-events-none"
        )}
        isOpen={!!isEditing.subtask}
        isDismissable={!isLoading}
        onClose={clearEdits}
      >
        <ModalContent className="max-w-lg">
          {isPending ? (
            // Skeleton while loading
            <div className="space-y-4 p-4">
              <Skeleton className="h-6 w-3/4" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <>
              {/* Modal Header: Title, Due Date, Status */}
              <ModalHeader className="flex justify-between gap-8 mt-2">
                <div className="flex flex-col gap-1">
                  <p className="text-2xl font-bold tracking-tight break-word">
                    {data?.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar size={15} />
                    <p className="text-sm font-normal">{formattedDate}</p>
                    <Chip size="sm" className="text-default-500 bg-opacity-40">
                      {!isDueToday && (isOverdue ? daysOverdue : daysDue)}{" "}
                      {isOverdue
                        ? "Days overdue"
                        : isDueToday
                          ? "It's today"
                          : "Days remaining"}
                    </Chip>
                  </div>
                </div>

                {/* Status chip or overdue warning */}
                {isOverdue ? (
                  <Chip
                    classNames={{ content: "flex items-center gap-2" }}
                    className="text-red-700 bg-red-900 bg-opacity-30"
                    aria-label="Overdue subtask"
                  >
                    <AlertCircle size={16} />
                    <p>Overdue</p>
                  </Chip>
                ) : (
                  <StatusTag status={localStatus as string} />
                )}
              </ModalHeader>

              {/* Modal Body: Description and Due Date */}
              <ModalBody className="space-y-5 pb-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-semibold">
                    <h2>Description</h2>
                    <Button
                      onPress={() => setIsOpen(true)}
                      radius="sm"
                      isDisabled={isLoading}
                      className="font-medium"
                    >
                      Edit
                    </Button>
                  </div>
                  <Card className="p-4 text-foreground-500 rounded-md">
                    {data?.description}
                  </Card>
                </div>

                <div className="space-y-2">
                  <h2 className="font-semibold">Due Date</h2>
                  <Card className="flex flex-row items-center gap-3 p-4 rounded-md">
                    <div className="bg-default-300 dark:bg-black rounded-full p-2.5 w-fit">
                      <Calendar />
                    </div>
                    <div>
                      <p className="text-sm lg:text-lg">{formattedDate}</p>
                      <p
                        className={cn(
                          "text-xs",
                          isOverdue ? "text-red-800" : "text-foreground-500"
                        )}
                      >
                        {!isDueToday && (isOverdue ? daysOverdue : daysDue)}{" "}
                        {isOverdue
                          ? "days overdue"
                          : isDueToday
                            ? "it's today"
                            : "days remaining"}
                      </p>
                    </div>
                  </Card>
                </div>
              </ModalBody>

              {/* Modal Footer: Actions */}
              <Divider />
              <ModalFooter className="flex justify-between">
                <div className="flex items-end">
                  <Button
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    onPress={handleMarkAs}
                    aria-label="Change subtask status"
                  >
                    <CheckCircle size={20} />
                    Mark as{" "}
                    {localStatus === "pending"
                      ? "in progress"
                      : localStatus === "completed"
                        ? "pending"
                        : "completed"}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    radius="sm"
                    className="bg-red-800"
                    isDisabled={isLoading}
                    aria-label="Delete subtask"
                    onPress={handleDelete}
                  >
                    Delete
                  </Button>
                  <Button
                    radius="sm"
                    isDisabled={isLoading}
                    onPress={clearEdits}
                    aria-label="Close subtask modal"
                  >
                    Close
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Modal - Opens when "Edit" is clicked */}
      <EditTaskModal
        isOpen={isOpen}
        isOverdue={isOverdue}
        subtask={data as Subtask}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default SubtaskDetailsModal;
