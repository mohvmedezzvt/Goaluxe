import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2 } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import useEdit from "@/stores/useEdit";

import useDelete from "@/stores/useDelete";

const GoalDetailedCard = ({
  id,
  title,
  description,
  progress,
  dueDate,
  status,
}: Goal) => {
  const { setEdit } = useEdit();
  const { setDelete } = useDelete();
  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => setEdit(id)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600"
            onClick={() => {
              setDelete(id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Target: {new Date(dueDate).toLocaleDateString()}</span>
          <span className="capitalize">{status}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalDetailedCard;
