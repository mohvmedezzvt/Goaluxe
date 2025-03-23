"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDate } from "@internationalized/date";
import { api } from "@/lib/api";
import { cn, validateDueDate } from "@/lib/utils";
import useEdit from "@/stores/useEdit";
import {
  Modal,
  ModalBody,
  Button,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Input,
  Textarea,
  DatePicker,
  CalendarDate as HeroUIDate,
  Select,
  SelectItem,
} from "@heroui/react";
import { format } from "date-fns";

/**
 * EditGoalModal Component
 *
 * A modal component that allows users to edit the details of a specific goal.
 * It fetches the goal data based on the `isEditing` state, validates the due date,
 * and provides a form to update the goal's title, description, due date, and status.
 *
 * @returns {JSX.Element} The rendered EditGoalModal component.
 *
 * @example
 *  Usage in a parent component
 * const [isEditing, setEdit] = useState<string | null>(null);
 *
 * <EditGoalModal />
 *
 *  When you want to edit a goal, set the `isEditing` state to the goal's ID:
 * setEdit("goal-id-123");
 */
export function EditGoalModal() {
  const queryClient = useQueryClient();
  const { isEditing, clearEdits } = useEdit();

  // State for form data and validation errors
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    dueDate: HeroUIDate | null;
    status: "active" | "completed" | "cancelled";
  }>({
    title: "",
    description: "",
    dueDate: null,
    status: "active",
  });

  const [isDateError, setIsDateError] = useState(false);

  // Mutation to update the goal
  const { mutate, isPending } = useMutation<
    any,
    Error,
    {
      title: Goal["title"];
      status: Goal["status"];
      dueDate: Goal["dueDate"];
      description: Goal["description"];
    }
  >({
    mutationKey: ["goal", isEditing],
    mutationFn: async (data) => {
      return await api.put(`goals/${isEditing}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal", isEditing] });
      queryClient.invalidateQueries({ queryKey: ["Goals"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      clearEdits(); // Close modal after successful update
    },
  });

  // Query to fetch the goal data
  const { data: goal } = useQuery({
    queryKey: ["goal", isEditing],
    queryFn: async () => {
      const response = (await api.get<Goal>(`goals/${isEditing}`)).data;
      return response;
    },
    enabled: !!isEditing, // Only fetch if `isEditing` is truthy
  });

  useEffect(() => {
    if (!goal) return;

    // Format the due date if it exists
    const dueDate = goal.dueDate ? new Date(goal.dueDate) : null;

    // Prepare the form data
    const formattedFormData = {
      title: goal.title || "",
      description: goal.description || "",
      dueDate: dueDate
        ? new CalendarDate(
            dueDate.getFullYear(), // Year
            dueDate.getMonth() + 1, // Month (JavaScript months are 0-indexed)
            dueDate.getDate() // Day
          )
        : null,
      status: goal.status || "active",
    };

    // Update the form data state
    setFormData(formattedFormData);
  }, [goal]);

  /**
   * Handles setting the due date and validates it.
   *
   * @param {CalendarDate | null} dueDate - The due date selected from the DatePicker.
   */
  const handleSetDueDate = (dueDate: HeroUIDate | null) => {
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
        status: formData.status,
      });
    },
    [formData, isDateError, mutate]
  );

  return (
    <Modal
      backdrop="blur"
      isOpen={!!isEditing.goal || !!isEditing.subtask}
      onClose={() => clearEdits()}
    >
      <ModalContent className="text-foreground-800">
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            Edit {isEditing.goal?.goalId ? "Goal" : "Subtask"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4 py-4">
              {/* Title Input */}
              <div className="space-y-2">
                <Input
                  isRequired
                  id="title"
                  label="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter goal title"
                  required
                />
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <Textarea
                  isRequired
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
                />
              </div>

              {/* Due Date Input */}
              <div className="space-y-2">
                <DatePicker
                  isRequired
                  id="dueDate"
                  isInvalid={isDateError}
                  errorMessage="Due date cannot be in the past."
                  color={isDateError ? "danger" : "default"}
                  label="Target Date"
                  className={cn(isDateError && "border-red-500 text-red-500")}
                  value={formData.dueDate}
                  onChange={(e) => handleSetDueDate(e)}
                />
              </div>

              {/* Status Select */}
              <div className="space-y-2">
                <Select
                  isRequired
                  id="status"
                  label="status"
                  classNames={{
                    selectorIcon: "text-foreground-800",
                  }}
                  placeholder="Set status"
                  selectedKeys={[formData.status]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as Goal["status"],
                    }))
                  }
                  required
                >
                  <SelectItem
                    className="text-foreground-800"
                    key="active"
                    textValue="active"
                  >
                    Active
                  </SelectItem>
                  <SelectItem
                    className="text-foreground-800"
                    key="completed"
                    textValue="completed"
                  >
                    Completed
                  </SelectItem>
                  <SelectItem
                    className="text-foreground-800"
                    key="cancelled"
                    textValue="cancelled"
                  >
                    Cancelled
                  </SelectItem>
                </Select>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            {/* Close Button */}
            <Button
              type="button"
              className="border"
              onPress={() => clearEdits()}
              disabled={isPending}
            >
              Close
            </Button>

            {/* Save Changes Button */}
            <Button type="submit" disabled={isPending || isDateError}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
