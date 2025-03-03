"use client";
import React, { ReactNode } from "react";
import useTheme from "@/stores/useTheme";

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { IsTheme } = useTheme();
  return <div className={IsTheme}>{children}</div>;
};

export default ThemeProvider;
