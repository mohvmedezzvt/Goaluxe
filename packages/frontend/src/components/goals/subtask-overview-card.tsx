"use client";
import { Card } from "@heroui/react";
import React from "react";
import StatusTag from "./status-tag";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import limitCharacters, { cn } from "@/lib/utils";
import useEdit from "@/stores/useEdit";
import useDueDate from "@/hooks/useDueDate";

const SubtaskOverviewCard = React.memo(
  ({ id, title, status, dueDate, description, goal }: Subtask) => {
    const { setEditSubtask } = useEdit();
    const { isOverdue } = useDueDate(dueDate as string);

    const statusColor =
      status === "pending"
        ? "yellow-400"
        : status === "in-progress"
          ? "green-400"
          : status === "completed"
            ? "blue-400"
            : isOverdue
              ? "red-800"
              : "";

    return (
      <motion.div
        id={id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={cn(
            "p-4 border shadow-sm hover:shadow-lg duration-500 min-h-fit decoration-default-foreground",
            status === "completed" && "!opacity-50",
            `border-${statusColor}`
          )}
        >
          <div className="flex justify-between items-end">
            <div className="flex items-start gap-3 w-[60%]">
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
                    {new Date(dueDate).toLocaleDateString()}
                  </p>
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
