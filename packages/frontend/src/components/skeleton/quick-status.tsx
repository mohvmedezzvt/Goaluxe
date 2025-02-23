import { Skeleton } from "@heroui/react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export const QuickStatusCardSkeleton = () => {
  return (
    <Card className="hover:shadow-md transition-all w-[25%]">
      <CardContent className="p-4 sm:pt-6">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-10  rounded-full" />
          <div>
            <Skeleton className="h-4 w-20 mb-2  rounded-full" />
            <Skeleton className="h-6 w-24  rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProgressOverviewSkeleton = () => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-32 rounded-full" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-4 w-10 rounded-full" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <div className="pt-4 space-y-4">
            <div className="flex justify-between text-sm">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-4 w-10 rounded-full" />
            </div>
            <div className="flex justify-between text-sm">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-4 w-10 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const UpcomingDeadline = () => {
  return (
    <Card className="col-span-2 row-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-32 rounded-full" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <Skeleton className="h-4 w-40 mb-1 rounded-full" />
                <Skeleton className="h-3 w-32 rounded-full" />
              </div>
              <Skeleton className="h-2 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
