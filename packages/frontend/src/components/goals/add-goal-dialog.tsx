"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn, validateDueDate } from "@/lib/utils";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useRouter } from "next/navigation";

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * AddGoalDialog component allows users to add a new goal.
 * @param {boolean} open - Determines if the dialog is open.
 * @param {function} onOpenChange - Function to handle the dialog open state change.
 */
/**
 * Component for adding a new goal through a dialog interface.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Determines if the dialog is open.
 * @param {function} props.onOpenChange - Callback function to handle dialog open state change.
 * @returns {JSX.Element} The rendered AddGoalDialog component.
 *
 * @example
 * <AddGoalDialog open={isOpen} onOpenChange={setIsOpen} />
 *
 * @typedef {Object} AddGoalDialogProps
 * @property {boolean} open - Determines if the dialog is open.
 * @property {function} onOpenChange - Callback function to handle dialog open state change.
 *
 * @remarks
 * This component uses React Query's `useMutation` to handle the goal creation process.
 * It also uses local state to manage form data.
 *
 * @function handleSubmit
 * Handles form submission.
 * @param {React.FormEvent} e - The form event.
 *
 * @function setFormData
 * Updates the form data state.
 * @param {Object} prev - The previous state.
 * @param {string} prev.title - The title of the goal.
 * @param {string} prev.description - The description of the goal.
 * @param {string} prev.dueDate - The target date for the goal.
 *
 * @function mutate
 * Executes the mutation function to create a new goal.
 * @param {Object} formData - The form data.
 * @param {string} formData.title - The title of the goal.
 * @param {string} formData.description - The description of the goal.
 * @param {string} formData.dueDate - The target date for the goal.
 *
 * @function queryClient.invalidateQueries
 * Invalidates the queries with the key "Goals" to refresh the goal list.
 *
 * @function onOpenChange
 * Callback function to handle dialog open state change.
 *
 * @function setFormData
 * Updates the form data state.
 * @param {Object} prev - The previous state.
 * @param {string} prev.title - The title of the goal.
 * @param {string} prev.description - The description of the goal.
 * @param {string} prev.dueDate - The target date for the goal.
 */
export function AddGoalDialog({ open, onOpenChange }: AddGoalDialogProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [isDateError, setIsDateError] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: {
      title: string;
      description: string;
      dueDate: string;
    }) => {
      const response = (await api.post<Goal>("/goals", formData)).data;
      return response;
    },
    onSuccess: (response) => {
      router.push(`dashboard/goal/${response?.id}`);
      queryClient.invalidateQueries({ queryKey: ["Goals"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

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

  /**
   * Handles form submission.
   * @param {React.FormEvent} e - The form event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      mutate(formData);
    } finally {
      setFormData({ title: "", description: "", dueDate: "" });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Goal</DialogTitle>
            <DialogDescription>
              Create a new goal to track your progress.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Title</Label>
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
              <Label htmlFor="dueDate">Description</Label>
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
                value={formData.dueDate}
                className={cn(isDateError ? "text-red-500 border-red-500" : "")}
                onChange={(e) => handleSetDueDate(e.target.value)}
                required
              />
              {isDateError && (
                <p className="text-red-500">Due date cannot be in the past.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
