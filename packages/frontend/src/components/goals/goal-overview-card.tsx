import React from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import useEdit from "@/stores/useEdit";
import useDelete from "@/stores/useDelete";
import StatusTag from "./goal-status-tag";

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
const GoalOverViewCard = ({
  title,
  id,
  description,
  progress,
  status,
  dueDate,
}: Goal) => {
  const { setEdit } = useEdit();
  const { setDelete } = useDelete();

  return (
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
          <div className="flex flex-col sm:flex-row justify-between gap-4 h-full">
            <div className="flex-1 space-y-3 h-full">
              <div>
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
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
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:gap-4">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setEdit(id)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDelete(id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 text-sm">
                <StatusTag status={status} />
                <span className="text-muted-foreground whitespace-nowrap">
                  Due {new Date(dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GoalOverViewCard;
