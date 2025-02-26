import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarDate } from "@internationalized/date";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@heroui/react";
import { api } from "@/lib/api";
import { validateDueDate } from "@/lib/utils";

/**
 * Props for the AddTaskModal component.
 */
interface AddTaskModalProps {
  open: boolean; // Determines if the modal is open.
  onOpenChange: (open: boolean) => void; // Callback to handle modal open/close state.
  goalId: string; // The ID of the goal to which the task belongs.
}

/**
 * Data structure for creating a new task.
 */
interface CreateTaskData {
  title: string;
  description: string;
  dueDate: string | null;
}

/**
 * AddTaskModal Component
 *
 * A modal component that allows users to add a new task to a specific goal. It includes a form for entering
 * the task's title, description, and due date. The component uses React Query's `useMutation` to handle
 * the task creation process and refreshes the goal's data upon success.
 *
 * @param {AddTaskModalProps} props - The component props.
 * @returns {JSX.Element} The rendered AddTaskModal component.
 *
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * <AddTaskModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   goalId="123"
 * />
 */
const AddTaskModal = ({ open, onOpenChange, goalId }: AddTaskModalProps) => {
  const queryClient = useQueryClient();
  const titleInputRef = useRef<HTMLInputElement>(null);

  // State for form data and validation errors
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    dueDate: CalendarDate | null;
  }>({
    title: "",
    description: "",
    dueDate: null,
  });

  const [isDateError, setIsDateError] = useState(false);

  // Mutation to create a new task
  const { mutate, isPending } = useMutation<any, Error, CreateTaskData>({
    mutationKey: ["createTask"],
    mutationFn: async (data) => {
      await api.post(`/goals/${goalId}/subtasks`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal", goalId] }); // Refresh the goal's data
      onOpenChange(false); // Close the modal
    },
  });

  /**
   * Resets the form to its initial state.
   */
  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      dueDate: null,
    });
    setIsDateError(false);
  }, []);

  /**
   * Handles setting the due date and validates it.
   *
   * @param {CalendarDate | null} dueDate - The due date selected from the DatePicker.
   */
  const handleSetDueDate = (dueDate: CalendarDate | null) => {
    const formattedDueDate = dueDate
      ? format(dueDate.toDate("UTC"), "yyyy-MM-dd")
      : null;

    const isValid = validateDueDate(formattedDueDate as string);

    if (formattedDueDate != null) {
      setIsDateError(!isValid);
    }

    // Keep the CalendarDate in state for the DatePicker
    setFormData((prev) => ({
      ...prev,
      dueDate,
    }));
  };

  /**
   * Handles form submission.
   *
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.dueDate) {
        setIsDateError(true);
        return;
      }

      if (isDateError) return;

      const formattedDueDate = format(
        formData.dueDate.toDate("UTC"),
        "yyyy-MM-dd"
      );

      mutate({
        title: formData.title,
        description: formData.description,
        dueDate: formattedDueDate,
      });
    },
    [formData, isDateError, mutate]
  );

  // Focus the title input when the modal opens
  useEffect(() => {
    if (open) {
      titleInputRef.current?.focus();
    }
  }, [open]);

  return (
    <Modal
      backdrop="blur"
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onOpenChange(isOpen);
          resetForm();
        }
      }}
    >
      <ModalContent>
        <ModalHeader>New Task</ModalHeader>
        <Form
          onSubmit={handleSubmit}
          onReset={resetForm}
          className="!items-end"
        >
          <ModalBody className="w-full">
            {/* Title Input */}
            <Input
              isRequired
              ref={titleInputRef}
              label="Title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
            />

            {/* Description Textarea */}
            <Textarea
              isRequired
              label="Description"
              placeholder="Describe your task"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />

            {/* Due Date Picker */}
            <DatePicker
              isRequired
              label="Due date"
              isInvalid={isDateError}
              errorMessage="Due date cannot be in the past."
              color={isDateError ? "danger" : "default"}
              value={formData.dueDate}
              onChange={(date) => handleSetDueDate(date)}
            />
          </ModalBody>

          <ModalFooter>
            {/* Cancel Button */}
            <Button
              type="button"
              className="border"
              onPress={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={isPending}
            >
              Cancel
            </Button>

            {/* Submit Button */}
            <Button
              type="submit"
              className="bg-black text-white"
              disabled={isDateError || isPending}
              isLoading={isPending}
            >
              {isPending ? "Adding..." : "Add Task"}
            </Button>
          </ModalFooter>
        </Form>
      </ModalContent>
    </Modal>
  );
};

export default AddTaskModal;
