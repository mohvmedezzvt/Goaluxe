"use client";
import { Card, Checkbox, Spinner } from "@heroui/react";
import React, { useState } from "react";
import StatusTag from "./status-tag";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import limitCharacters, { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const SubtaskOverviewCard = React.memo(
  ({ id, title, status, dueDate, description, goal }: Subtask) => {
    const [localStatus, setLocalStatus] = useState<string>(status);
    const queryClient = useQueryClient();
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
      const newStatus = status === "completed" ? "pending" : "completed";
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
              <div className="space-y-2">
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
            <div className={cn(isPending && "opacity-70")}>
              <StatusTag status={localStatus} />
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }
);
SubtaskOverviewCard.displayName = "SubtaskOverviewCard";
export default SubtaskOverviewCard;
