"use client";
import { Card, CardBody, CardHeader, Skeleton } from "@heroui/react";

export const GoalDetailsSkeleton = () => {
  return (
    <div className="animate-pulse p-6">
      <div className="max-w-[1500px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Header Section */}
          <div className="col-span-full flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>

          {/* Progress Section */}
          <Card
            className="col-span-full lg:col-span-4 border rounded-2xl p-6 space-y-10 "
            shadow="none"
          >
            <CardHeader>
              <Skeleton className="h-5 w-[100px]" />
            </CardHeader>
            <CardBody>
              <Skeleton className="h-3 w-full rounded-full" />
            </CardBody>
          </Card>

          {/* Status Section */}
          <Card
            className="col-span-full lg:col-span-2 border rounded-2xl p-6 space-y-4"
            shadow="none"
          >
            <CardHeader>
              <div className="flex w-full justify-between items-center">
                <Skeleton className="h-5 w-[60px]" />
                <Skeleton className="h-6 w-[80px] rounded-full" />
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex gap-8">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[60px]" />
                  <Skeleton className="h-4 w-[80px]" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[60px]" />
                  <Skeleton className="h-4 w-[80px]" />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Sub-tasks Section */}
          <Card
            className="col-span-full lg:col-span-4 row-span-2 border rounded-2xl p-6 space-y-4"
            shadow="none"
          >
            <CardHeader>
              <div className="flex w-full justify-between items-center">
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-9 w-[140px] rounded-md" />
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="p-4 space-y-4">
                    <div className="flex justify-between">
                      <div className="flex items-start gap-3 w-[60%]">
                        <Skeleton className="w-5 h-5 rounded" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-[80px] rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Reward Section */}
          <Card
            className="col-span-full lg:col-span-2 border rounded-2xl p-6 space-y-4"
            shadow="none"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-5 w-[60px]" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-[140px]" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </Card>

          {/* Recent Activities Section */}
          <Card
            className="col-span-full lg:col-span-2 border rounded-2xl p-6 space-y-4"
            shadow="none"
          >
            <CardHeader>
              <Skeleton className="h-5 w-[140px]" />
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const SubtaskOverviewCardSkeleton = () => {
  return (
    <Card
      className="col-span-full lg:col-span-4 row-span-2 border rounded-2xl p-6 space-y-4"
      shadow="none"
    >
      <CardHeader>
        <div className="flex w-full justify-between items-center">
          <Skeleton className="h-5 w-[100px]" />
          <Skeleton className="h-9 w-[140px] rounded-md" />
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="p-4 space-y-4">
              <div className="flex justify-between">
                <div className="flex items-start gap-3 w-[60%]">
                  <Skeleton className="w-5 h-5 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-6 w-[80px] rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
