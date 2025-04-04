import { cn } from "@/lib/utils";
import { Chip } from "@heroui/react";
import React from "react";

const StatusTag = ({ status }: { status: string }) => {
  return (
    <Chip
      size="sm"
      aria-label="status"
      className={cn(
        "px-2 py-1 rounded-full h-fit text-xs whitespace-nowrap ",
        status === "active" && "bg-green-100 text-green-700",
        status === "in-progress" && "bg-green-100 text-green-700",
        status === "pending" && "bg-yellow-100 text-yellow-700",
        status === "completed" && "bg-blue-100 text-blue-700",
        status === "cancelled" && "bg-gray-100 text-gray-700"
      )}
    >
      {status}
    </Chip>
  );
};

export default StatusTag;
