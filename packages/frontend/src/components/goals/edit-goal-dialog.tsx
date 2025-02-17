"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface EditGoalDialogProps {
  goalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
export function EditGoalDialog({
  goalId,
  open,
  onOpenChange,
}: EditGoalDialogProps) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["Goal", goalId],
    mutationFn: async () => {
      return await api.put(`goals/${goalId}`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Goals"] });
      queryClient.invalidateQueries({ queryKey: ["Goal", goalId] });
    },
  });

  const { data: goal } = useQuery({
    queryKey: ["Goal", goalId],
    queryFn: async (): Promise<Goal> => {
      const response = await api.get(`goals/${goalId}`);
      return response.data as Goal;
    },
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    progress: 0,
    status: "active" as Goal["status"],
  });

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        description: goal.description,
        dueDate: new Date(goal.dueDate).toISOString().split("T")[0],
        progress: goal.progress,
        status: goal.status,
      });
    }
  }, [goalId, goal]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            try {
              e.preventDefault();
              mutate();
            } finally {
              setFormData;
              onOpenChange(false);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>
              Update your goal details and progress.
            </DialogDescription>
          </DialogHeader>
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
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dueDate: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    progress: parseInt(e.target.value) || 0,
                  }))
                }
                required
              />
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
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
