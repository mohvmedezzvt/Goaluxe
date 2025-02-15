import { cn } from "@/lib/utils";
import { Progress } from "@radix-ui/react-progress";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import useEdit from "@/stores/useEdit";

const GoalOverViewCard = ({
  title,
  id,
  description,
  progress,
  status,
  targetDate,
}: Goal) => {
  const { setEdit } = useEdit();
  console.log(title, id, description, progress, status, targetDate);
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
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
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
                {/* <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEdit(id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button> */}
              </div>
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 text-sm">
                <span
                  className={cn(
                    "px-2 py-1 rounded-full text-xs whitespace-nowrap",
                    status === "active" && "bg-green-100 text-green-700",
                    status === "completed" && "bg-blue-100 text-blue-700",
                    status === "archived" && "bg-gray-100 text-gray-700"
                  )}
                >
                  {status}
                </span>
                <span className="text-muted-foreground whitespace-nowrap">
                  Due {new Date(targetDate).toLocaleDateString()}
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
