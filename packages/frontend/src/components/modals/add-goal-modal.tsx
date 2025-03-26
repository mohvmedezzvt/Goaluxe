"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Button,
  CalendarDate,
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
 * Props for the AddGoalModal component.
 */
interface AddGoalModalProps {
  open: boolean; // Determines if the modal is open.
  onOpenChange: (open: boolean) => void; // Callback to handle modal open/close state.
}

/**
 * AddGoalModal Component
 *
 * A modal component that allows users to add a new goal. It includes a form for entering
 * the goal's title, description, and target date. The component uses React Query's
 * `useMutation` to handle the goal creation process and redirects the user to the newly
 * created goal's dashboard page upon success.
 *
 * @param {AddGoalModalProps} props - The component props.
 * @returns {JSX.Element} The rendered AddGoalModal component.
 *
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * <AddGoalModal open={isOpen} onOpenChange={setIsOpen} />
 */
export function AddGoalModal({ open, onOpenChange }: AddGoalModalProps) {
  const queryClient = useQueryClient();
  // const router = useRouter();
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

  // Mutation to create a new goal
  const { mutate, isPending } = useMutation<
    Goal,
    Error,
    { title: string; description: string; dueDate: string }
  >({
    mutationFn: async (data) => {
      const response = (await api.post<Goal>("/goals", data)).data;
      if (!response || !response.id) {
        throw new Error("Failed to create goal: Invalid server response");
      }
      return response;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["Goals"],
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: ["analytics"],
          refetchType: "all",
        }),
      ]);

      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Failed to create goal:", error);
    },
  });

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

  // Focus the title input when the modal opens
  useEffect(() => {
    if (open) {
      titleInputRef.current?.focus();
    }
  }, [open]);

  return (
    <Modal backdrop="blur" isOpen={open} onOpenChange={onOpenChange}>
      <ModalContent className="text-foreground-800">
        <ModalHeader>
          <p>Add New Goal</p>
        </ModalHeader>
        <Form
          onSubmit={handleSubmit}
          className="!items-end"
          onReset={resetForm}
        >
          <ModalBody className="w-full">
            {/* Title Input */}
            <Input
              id="title"
              ref={titleInputRef}
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter goal title"
              required
            />

            {/* Description Textarea */}
            <Textarea
              id="description"
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe your goal"
              required
            />

            {/* Due Date Picker */}
            <DatePicker
              isRequired
              id="due-date"
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
              {isPending ? "Adding..." : "Add Goal"}
            </Button>
          </ModalFooter>
        </Form>
      </ModalContent>
    </Modal>
  );
}
