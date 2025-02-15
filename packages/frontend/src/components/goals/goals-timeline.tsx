"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CalendarDays, Circle } from "lucide-react";

interface GoalsTimelineProps {
  goals: Goal[];
}

export function GoalsTimeline({ goals }: GoalsTimelineProps) {
  const sortedGoals = [...goals]
    .filter((goal) => goal.status === "active")
    .sort(
      (a, b) =>
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    )
    .slice(0, 5); // Show only next 5 upcoming goals

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Upcoming Goals Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 border-l">
          {sortedGoals.map((goal, index) => {
            const daysLeft = Math.ceil(
              (new Date(goal.targetDate).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            );
            const isOverdue = daysLeft < 0;

            return (
              <div
                key={goal._id}
                className={`relative mb-8 last:mb-0 ${
                  isOverdue ? "text-red-500" : ""
                }`}
              >
                <Circle className="absolute -left-[1.6rem] w-4 h-4 mt-1.5 fill-background" />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{goal.title}</span>
                    <span className="text-sm text-muted-foreground">
                      ({goal.progress}% complete)
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Due {new Date(goal.targetDate).toLocaleDateString()}
                    <span className="ml-2">
                      ({isOverdue ? "Overdue" : `${daysLeft} days left`})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {sortedGoals.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">
              No upcoming goals. Add some goals to see your timeline!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
