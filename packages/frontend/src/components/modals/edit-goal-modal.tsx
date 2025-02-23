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
 * EditGoalDialog component allows users to edit the details of a specific goal.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.goalId - The ID of the goal to be edited.
 * @param {boolean} props.open - A boolean indicating whether the dialog is open.
 * @param {function} props.onOpenChange - A callback function to handle the change in dialog open state.
 *
 * @returns {JSX.Element} The rendered EditGoalDialog component.
 *
 * @component
 * @example
 * const goalId = "123";
 * const [open, setOpen] = useState(false);
 *
 * <EditGoalDialog
 *   goalId={goalId}
 *   open={open}
 *   onOpenChange={setOpen}
 * />
 */
/**
 * Component for editing a goal in a dialog.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.goalId - The ID of the goal to be edited.
 * @param {boolean} props.open - Boolean indicating whether the dialog is open.
 * @param {function} props.onOpenChange - Callback function to handle the dialog open state change.
 *
 * @typedef {Object} EditGoalDialogProps
 * @property {string} goalId - The ID of the goal to be edited.
 * @property {boolean} open - Boolean indicating whether the dialog is open.
 * @property {function} onOpenChange - Callback function to handle the dialog open state change.
 *
 * @returns {JSX.Element} The rendered EditGoalDialog component.
 *
 * @example
 * <EditGoalDialog
 *   goalId="123"
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 * />
 */
export function EditGoalModal() {
  const queryClient = useQueryClient();
  const { isEditing, setEdit } = useEdit();

  const { mutate, isPending } = useMutation({
    mutationKey: ["Goal", isEditing],
    mutationFn: async () => {
      return await api.put(`goals/${isEditing}`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal", isEditing] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const { data: goal } = useQuery({
    queryKey: ["goal", isEditing],
    queryFn: async () => {
      const response = (await api.get<Goal>(`goals/${isEditing}`)).data;
      if (response?.id === undefined) {
        return formData;
      } else {
        return response;
      }
    },
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "active" as Goal["status"],
  });

  const [isDateError, setIsDateError] = useState(false);

  const handleSetDueDate = (dueDate: string) => {
    const dateValidation = validateDueDate(dueDate);
    if (dateValidation) {
      setFormData((prev) => ({
        ...prev,
        dueDate: dueDate, // Ensure `dueDate` remains a string
      }));
      setIsDateError(false);
    } else {
      setIsDateError(true);
    }
  };

  useEffect(() => {
    if (goal) {
      // Safely handle the case where `goal.dueDate` is undefined
      const dueDate = goal.dueDate
        ? new Date(goal.dueDate).toISOString().split("T")[0]
        : "";

      setFormData({
        title: goal.title || "",
        description: goal.description || "",
        dueDate: dueDate, // Use the safely parsed date
        status: goal.status || "active",
      });
    } else {
      // If `goal` is undefined, reset the form data to default values
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        status: "active",
      });
    }
  }, [isEditing, goal]);

  return (
    <Modal backdrop="blur" isOpen={!!isEditing} onClose={() => setEdit(null)}>
      <ModalContent>
        <form
          onSubmit={(e) => {
            try {
              e.preventDefault();
              mutate();
            } finally {
              setFormData;
            }
          }}
        >
          <ModalHeader>
            Edit Goal Update your goal details and progress.
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4 py-4">
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
              <div className="space-y-2">
                <Label htmlFor="dueDate">Target Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  className={cn(
                    isDateError ? "border-red-500 text-red-500" : ""
                  )}
                  value={formData.dueDate}
                  onChange={(e) => handleSetDueDate(e.target.value)}
                  required
                />
                {isDateError && (
                  <p className="text-red-500">
                    Due date cannot be in the past.
                  </p>
                )}
              </div>
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
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEdit(null)}
              disabled={isPending}
            >
              Close
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
