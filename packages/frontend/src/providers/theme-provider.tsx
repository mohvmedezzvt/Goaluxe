"use client";
import React, { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";
import useTheme from "@/stores/useTheme";

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();

  // Apply the theme class to the body element after the component mounts
  useEffect(() => {
    document.body.className = cn(theme, "text-foreground bg-background");
  }, [theme]);

  return <>{children}</>;
};

export default ThemeProvider;
