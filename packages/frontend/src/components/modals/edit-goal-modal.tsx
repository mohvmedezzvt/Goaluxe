"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn, validateDueDate } from "@/lib/utils";
import useEdit from "@/stores/useEdit";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

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
 * // Usage in a parent component
 * const [isEditing, setEdit] = useState<string | null>(null);
 *
 * <EditGoalModal />
 *
 * // When you want to edit a goal, set the `isEditing` state to the goal's ID:
 * setEdit("goal-id-123");
 */
export function EditGoalModal() {
  const queryClient = useQueryClient();
  const { isEditing, setEdit } = useEdit();

  // State for form data and validation errors
  const [formData, setFormData] = useState<Partial<Goal>>({
    title: "",
    description: "",
    dueDate: "",
    status: "active",
  });

  const [isDateError, setIsDateError] = useState(false);

  // Mutation to update the goal
  const { mutate, isPending } = useMutation({
    mutationKey: ["goal", isEditing],
    mutationFn: async () => {
      return await api.put(`goals/${isEditing}`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal", isEditing] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      setEdit(null); // Close modal after successful update
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

  // Effect to populate form data when the goal is fetched
  useEffect(() => {
    if (goal) {
      const dueDate = goal.dueDate
        ? new Date(goal.dueDate).toISOString().split("T")[0]
        : "";

      setFormData({
        title: goal.title || "",
        description: goal.description || "",
        dueDate,
        status: goal.status || "active",
      });
    }
  }, [goal]);

  /**
   * Handles setting the due date and validates it.
   *
   * @param {string} dueDate - The due date string in YYYY-MM-DD format.
   */
  const handleSetDueDate = (dueDate: string) => {
    const isValidDate = validateDueDate(dueDate);
    setIsDateError(!isValidDate);

    if (isValidDate) {
      setFormData((prev) => ({
        ...prev,
        dueDate,
      }));
    }
  };

  /**
   * Handles form submission.
   *
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDateError) {
      mutate();
    }
  };

  return (
    <Modal backdrop="blur" isOpen={!!isEditing} onClose={() => setEdit(null)}>
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Edit Goal</ModalHeader>
          <ModalBody>
            <div className="space-y-4 py-4">
              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
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
              </div>

              {/* Due Date Input */}
              <div className="space-y-2">
                <Label htmlFor="dueDate">Target Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  className={cn(isDateError && "border-red-500 text-red-500")}
                  value={formData.dueDate as string}
                  onChange={(e) => handleSetDueDate(e.target.value)}
                  required
                />
                {isDateError && (
                  <p className="text-red-500">
                    Due date cannot be in the past.
                  </p>
                )}
              </div>

              {/* Status Select */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as Goal["status"],
                    }))
                  }
                  required
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            {/* Close Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setEdit(null)}
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
