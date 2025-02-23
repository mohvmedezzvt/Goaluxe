import { Skeleton } from "@heroui/react";
import { Card, CardContent, CardHeader } from "../ui/card";

export function OverviewGoalCardSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <Skeleton className="h-6 w-[150px] rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-xl" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full rounded-full" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-[100px] rounded-full" />
                <Skeleton className="h-4 w-[50px] rounded-full" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-[120px] rounded-full" />
              <Skeleton className="h-4 w-[80px] rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
