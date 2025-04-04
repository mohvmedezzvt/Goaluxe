import { api } from "@/lib/api";
import { cn, validateDueDate } from "@/lib/utils";
import {
  Button,
  DatePicker,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { CalendarDate as HeroUIDate } from "@heroui/react";
import { CalendarDate } from "@internationalized/date";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import React, { useCallback, useEffect, useState } from "react";
import StatusTag from "../goals/status-tag";

// Define the structure for subtask form data
type TaskData = {
  title: string;
  description: string;
  dueDate: string;
  status: Subtask["status"];
};

/**
 * EditTaskModal component allows users to update subtask details like
 * title, description, due date, and status.
 */
const EditTaskModal = ({
  subtask,
  isOpen,
  onClose,
  isOverdue,
}: {
  subtask: Subtask | undefined;
  isOpen: boolean;
  onClose: () => void;
  isOverdue: boolean;
}) => {
  const queryClient = useQueryClient();

  const [isDateError, setIsDateError] = useState(false); // Flag for invalid date
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    dueDate: HeroUIDate | null;
    status: Subtask["status"];
  }>({
    title: "",
    description: "",
    dueDate: null,
    status: "pending",
  });

  /**
   * Handles task mutation to update the subtask via API.
   */
  const { mutate, isPending } = useMutation<any, Error, TaskData>({
    mutationKey: [`editTask-${subtask?.id}`, `goal-${subtask?.goal}`],
    mutationFn: async (data) => {
      return await api.patch(
        `/goals/${subtask?.goal}/subtasks/${subtask?.id}`,
        data
      );
    },
    onSuccess: () => {
      onClose(); // Close modal on success
    },
    onSettled: () => {
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["subtasks", `goal-${subtask?.goal}`],
      });
      queryClient.invalidateQueries({
        queryKey: ["goal", subtask?.goal],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: [`subtask-${subtask?.id}`, `goal-${subtask?.goal}`],
        exact: true,
      });
    },
  });

  /**
   * Handles form submission to update the subtask.
   */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.dueDate) {
        setIsDateError(true);
        return;
      }

      if (isDateError) return;

      // Convert CalendarDate to string for API
      const formattedDueDate = format(
        formData.dueDate.toDate("UTC"),
        "yyyy-MM-dd"
      );

      mutate({
        title: formData.title,
        description: formData.description,
        dueDate: formattedDueDate,
        status: formData.status,
      });
    },
    [formData, isDateError, mutate]
  );

  /**
   * Populate form fields when modal opens with subtask data.
   */
  useEffect(() => {
    if (!subtask) return;

    const dueDate = subtask.dueDate ? new Date(subtask.dueDate) : null;

    const formattedFormData = {
      title: subtask.title || "",
      description: subtask.description || "",
      dueDate: dueDate
        ? new CalendarDate(
            dueDate.getFullYear(),
            dueDate.getMonth() + 1,
            dueDate.getDate()
          )
        : null,
      status: subtask.status || "active",
    };

    setFormData(formattedFormData);
  }, [subtask]);

  /**
   * Handle changes to the due date, with validation.
   */
  const handleSetDueDate = useCallback((dueDate: HeroUIDate | null) => {
    const formattedDueDate = dueDate
      ? format(dueDate.toDate("UTC"), "yyyy-MM-dd")
      : null;

    const isValid = validateDueDate(formattedDueDate as string);

    if (formattedDueDate != null) {
      setIsDateError(!isValid);
    }

    setFormData((prev) => ({
      ...prev,
      dueDate,
    }));
  }, []);

  // Set border color based on task status
  const borderTopColor =
    formData.status === "pending"
      ? "border-yellow-400"
      : formData.status === "in-progress"
        ? "border-green-400"
        : formData.status === "completed"
          ? "border-blue-400"
          : isOverdue
            ? "border-red-800"
            : "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={cn(
        "pt-4 border-t-8",
        borderTopColor,
        isPending && "opacity-70"
      )}
    >
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalBody className="mt-2 pb-4">
            {/* Title and Status */}
            <div className="flex justify-between gap-4">
              <Input
                required
                placeholder="Task Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <StatusTag status={formData.status} />
            </div>

            {/* Due Date Picker */}
            <DatePicker
              size="sm"
              className="w-[50%]"
              value={formData.dueDate}
              onChange={handleSetDueDate}
            />

            {/* Description Field */}
            <Textarea
              isRequired
              label="Description"
              labelPlacement="outside"
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe your goal"
            />

            {/* Status Selector */}
            <div className="space-y-2">
              <Select
                isRequired
                id="status"
                label="status"
                labelPlacement="outside"
                classNames={{ selectorIcon: "text-foreground-800" }}
                placeholder="Set status"
                selectedKeys={[formData.status]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as Subtask["status"],
                  }))
                }
              >
                <SelectItem key="in-progress" textValue="in-progress">
                  in progress
                </SelectItem>
                <SelectItem key="completed" textValue="completed">
                  Completed
                </SelectItem>
                <SelectItem key="pending" textValue="pending">
                  pending
                </SelectItem>
              </Select>
            </div>
          </ModalBody>

          <Divider />

          <ModalFooter>
            {/* Close Modal */}
            <Button
              type="button"
              className="border"
              onPress={onClose}
              disabled={isPending}
            >
              Close
            </Button>

            {/* Submit Button */}
            <Button type="submit" disabled={isPending || isDateError}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditTaskModal;
