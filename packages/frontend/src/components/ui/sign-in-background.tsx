"use client";

import { Ripple } from "@/components/magicui/ripple";

export function SignInBackGround() {
  return (
    <div className="absolute flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background">
      <Ripple mainCircleSize={700} />
    </div>
  );
}
