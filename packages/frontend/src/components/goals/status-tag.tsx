import { cn } from "@/lib/utils";
import React from "react";

const StatusTag = ({ status }: { status: string }) => {
  return (
    <span
      className={cn(
        "px-2 py-1 rounded-full h-fit text-xs whitespace-nowrap",
        status === "active" && "bg-green-100 text-green-700",
        status === "pending" && "bg-green-100 text-green-700",
        status === "completed" && "bg-blue-100 text-blue-700",
        status === "cancelled" && "bg-gray-100 text-gray-700"
      )}
    >
      {status}
    </span>
  );
};

export default StatusTag;
