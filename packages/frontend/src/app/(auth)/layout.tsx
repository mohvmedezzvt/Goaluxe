import { SignInBackGround } from "@/components/ui/sign-in-background";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative">
      <SignInBackGround />
      {children}
    </div>
  );
};

export default AuthLayout;
