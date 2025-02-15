"use client";

import { useState } from "react";
import { useGoals } from "@/hooks/use-goals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { EditGoalDialog } from "@/components/goals/edit-goal-dialog";
import { Loading } from "@/components/ui/loading";

export default function GoalsPage() {
  const { goals, loading } = useGoals();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Goals</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <Card key={goal._id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-base font-medium">
                {goal.title}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingGoal(goal._id)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {goal.description}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Target: {new Date(goal.targetDate).toLocaleDateString()}
                </span>
                <span className="capitalize">{goal.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddGoalDialog open={showAddDialog} onOpenChange={setShowAddDialog} />

      {editingGoal && (
        <EditGoalDialog
          goalId={editingGoal}
          open={true}
          onOpenChange={() => setEditingGoal(null)}
        />
      )}
    </div>
  );
}
