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
  Spinner,
} from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Calendar, CheckCircle } from "lucide-react";
import StatusTag from "../goals/status-tag";
import EditTaskModal from "./edit-task-modal";

/**
 * Displays a modal containing subtask details for viewing, editing, and status management.
 * Uses data from the global `useEdit` store to determine which subtask to display.
 */
const SubtaskDetailsModal = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState<boolean>(false); // Controls visibility of the edit modal
  const { setDeleteSubtask } = useDelete(); // Set subtask to delete via global state
  const { isEditing, clearEdits } = useEdit(); // Access current editing subtask and function to clear it

  /**
   * Fetch the subtask details from the API when a subtask is selected for editing.
   * Query is enabled only when a subtask is selected.
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

  // Extract and format due date information using a custom hook
  const { formattedDate, daysDue, isOverdue, daysOverdue, isDueToday } =
    useDueDate(data?.dueDate as string);

  const [localStatus, setLocalStatus] = useState<string>(
    data?.status as string
  );

  // Sync local status with updated data
  useEffect(() => {
    setLocalStatus(data?.status as string);
  }, [data?.status]);

  /**
   * Mutation for updating subtask status (e.g., mark as completed/in-progress).
   * Automatically invalidates relevant queries on settle.
   */
  const { mutate, isPending: mutationPending } = useMutation({
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
    onSettled: () => {
      // Invalidate queries to refresh data after status change
      queryClient.invalidateQueries({
        queryKey: ["subtasks", `goal-${data?.goal}`],
        exact: true,
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
  });

  /**
   * Triggers subtask deletion using global state logic.
   */
  const handleDelete = useCallback(() => {
    if (data?.id && data?.goal) {
      setDeleteSubtask(data.id, data.goal);
    }
  }, [data, setDeleteSubtask]);

  /**
   * Updates subtask status based on current status.
   * Cycles through: pending -> in-progress -> completed
   */
  const handleMarkAs = () => {
    if (!data?.goal || !data?.id) return;

    const newStatus =
      localStatus === "pending"
        ? "in-progress"
        : localStatus === "completed"
          ? "pending"
          : "completed";

    mutate(newStatus);
    setLocalStatus(newStatus);
  };

  // Determine top border color based on subtask status
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

  if (mutationPending) return null;

  return (
    <>
      {/* Subtask details modal */}
      <Modal
        backdrop="blur"
        className={cn(
          "pt-4 border-t-8 ",
          borderTopColor,
          mutationPending && "opacity-70"
        )}
        isOpen={!!isEditing.subtask}
        onClose={clearEdits}
      >
        <ModalContent className="max-w-lg">
          {isPending ? (
            // Loading skeleton while fetching subtask
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
              <ModalHeader className="flex justify-between gap-8 mt-2">
                {/* Title and due date section */}
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

              <ModalBody className="space-y-5 pb-4">
                {/* Description block */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-semibold">
                    <h2>Description</h2>
                    <Button
                      onPress={() => setIsOpen(true)}
                      radius="sm"
                      className="font-medium"
                    >
                      Edit
                    </Button>
                  </div>
                  <Card className="p-4 text-foreground-500 rounded-md">
                    {data?.description}
                  </Card>
                </div>

                {/* Due date block */}
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

              <Divider />

              {/* Footer with action buttons */}
              <ModalFooter className="flex justify-between">
                <div className="flex items-end">
                  <Button
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
                  {mutationPending && <Spinner size="sm" />}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    radius="sm"
                    className="bg-red-800"
                    aria-label="Delete subtask"
                    onPress={handleDelete}
                  >
                    Delete
                  </Button>
                  <Button
                    radius="sm"
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

      {/* Modal for editing the task */}
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
