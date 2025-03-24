"use client";
import { Button, Card, Checkbox, Spinner } from "@heroui/react";
import React, { useState } from "react";
import StatusTag from "./status-tag";
import { Calendar, Trash } from "lucide-react";
import { motion } from "framer-motion";
import limitCharacters, { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useDelete from "@/stores/useDelete";
import useEdit from "@/stores/useEdit";

const SubtaskOverviewCard = React.memo(
  ({ id, title, status, dueDate, description, goal }: Subtask) => {
    const [localStatus, setLocalStatus] = useState<string>(status);
    const { setDeleteSubtask } = useDelete();
    const queryClient = useQueryClient();
    const { setEditSubtask } = useEdit();
    const { mutate, isPending } = useMutation({
      mutationFn: async (newStatus: string) => {
        return await api.patch(`/goals/${goal}/subtasks/${id}`, {
          status: newStatus,
        });
      },
      mutationKey: ["subtask", id, `goal-${goal}`],
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["subtasks", `goal-${goal}`],
        });
        queryClient.invalidateQueries({ queryKey: ["goal", goal] });
      },
    });

    const handleComplete = () => {
      const newStatus = localStatus === "completed" ? "pending" : "completed";
      setLocalStatus(newStatus);
      mutate(newStatus);
    };

    return (
      <motion.div
        id={id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="p-4 border shadow-sm hover:shadow-md transition-shadow min-h-fit decoration-default-foreground">
          <div className="flex justify-between">
            <div className="flex items-start gap-3 w-[60%]">
              <Checkbox
                className="mt-1"
                onChange={handleComplete}
                isSelected={localStatus === "completed"}
                isDisabled={isPending}
              />
              <div
                className="space-y-2 w-full cursor-pointer"
                onClick={() => setEditSubtask(id, goal)}
              >
                <p
                  className={cn(
                    status === "completed" && "line-through",
                    "font-medium"
                  )}
                >
                  {title}
                </p>
                <p
                  className={cn(
                    status === "completed" && "line-through",
                    "text-gray-500 text-sm"
                  )}
                >
                  {limitCharacters({ str: description, maxLength: 50 })}
                </p>
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar size={14} />
                  <p className="text-sm">
                    Due {new Date(dueDate).toLocaleDateString()}
                  </p>
                  {isPending && <Spinner size="sm" />}
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between items-end">
              <Button
                isIconOnly
                size="sm"
                onPress={() => setDeleteSubtask(id, goal)}
                className="bg-default-100 "
              >
                <Trash className="text-red-500" size={16} />
              </Button>
              <div className={cn(isPending && "opacity-70")}>
                <StatusTag status={localStatus} />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }
);
SubtaskOverviewCard.displayName = "SubtaskOverviewCard";
export default SubtaskOverviewCard;
