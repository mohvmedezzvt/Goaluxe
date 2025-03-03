"use client";
import { Card, Checkbox, Spinner } from "@heroui/react";
import React from "react";
import StatusTag from "./status-tag";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import limitCharacters from "@/lib/utils";
import { useOptimisticUpdate } from "@/hooks/use-optimistic-update";
import { api } from "@/lib/api";

const SubtaskOverviewCard = React.memo(
  ({ id, title, status, createdAt, dueDate, description, goal }: Subtask) => {
    const updateMutation = useOptimisticUpdate({
      mutationFn: async (data: Subtask) => {
        return await api.patch(`/goals/${goal}/subtasks/${id}`, data);
      },
      queryKey: ["subtasks", `goal-${goal}`],
    });

    const handleComplete = () => {
      updateMutation.mutate({
        ...{ id, title, status, createdAt, dueDate, description, goal },
        status: status === "completed" ? "active" : "completed",
      });
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
        <Card className="p-4 border shadow-sm hover:shadow-md transition-shadow min-h-fit ">
          <div className="flex justify-between">
            <div className="flex items-start gap-3 w-[60%]">
              <Checkbox
                className="mt-1"
                checked={status === "completed"}
                onChange={handleComplete}
              />
              <div className="space-y-2">
                <p className="font-medium">{title}</p>
                <p className="text-gray-500 text-sm">
                  {limitCharacters({ str: description, maxLength: 50 })}
                </p>
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar size={14} />
                  <p className="text-sm">
                    Due {new Date(dueDate).toLocaleDateString()}
                  </p>
                  {updateMutation.isPending && <Spinner size="sm" />}
                </div>
              </div>
            </div>
            <StatusTag status={status} />
          </div>
        </Card>
      </motion.div>
    );
  }
);
SubtaskOverviewCard.displayName = "SubtaskOverviewCard";
export default SubtaskOverviewCard;
