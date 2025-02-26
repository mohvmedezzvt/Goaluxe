import React from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "../ui/card";
import StatusTag from "./status-tag";
import Link from "next/link";
import limitCharacters from "@/lib/utils";

/**
 * Component representing an overview card for a goal.
 *
 * @component
 * @param {Object} props - The properties object.
 * @param {string} props.title - The title of the goal.
 * @param {string} props.id - The unique identifier of the goal.
 * @param {string} props.description - A brief description of the goal.
 * @param {number} props.progress - The progress percentage of the goal.
 * @param {string} props.status - The current status of the goal. Can be "active", "completed", or "cancelled".
 * @param {string} props.dueDate - The due date of the goal in ISO format.
 * @returns {JSX.Element} The rendered GoalOverViewCard component.
 *
 * @example
 * <GoalOverViewCard
 *   title="Learn TypeScript"
 *   id="1"
 *   description="Complete the TypeScript course on Codecademy"
 *   progress={50}
 *   status="active"
 *   dueDate="2023-12-31"
 * />
 */
const GoalOverviewCard = React.memo(
  ({ title, id, description, progress, status, dueDate }: Goal) => {
    return (
      <Link href={`/dashboard/goal/${id}`} className="block">
        <motion.div
          key={id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="hover:shadow-md transition-all duration-200 group">
            <CardContent className="p-4 h-full">
              <div className="flex flex-col items-end sm:flex-row justify-between gap-4 h-full">
                <div className="flex-1 space-y-3 h-full">
                  <div>
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                      {title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 text-wrap max-w-full">
                      {limitCharacters({ str: description, maxLength: 50 })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 text-sm">
                  <StatusTag status={status} />
                  <span className="text-muted-foreground whitespace-nowrap">
                    Due {new Date(dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Link>
    );
  }
);

export default GoalOverviewCard;
