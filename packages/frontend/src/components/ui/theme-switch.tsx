import useTheme from "@/stores/useTheme";
import { Button } from "@heroui/react";
import { Sun, Moon } from "lucide-react";
import React, { useEffect } from "react";

const ThemeSwitch = () => {
  const { IsTheme, setTheme } = useTheme();

  useEffect(() => {
    // Load theme from localStorage or default to light
    const storedTheme = localStorage.getItem("theme") || "light";
    const validTheme = storedTheme === "dark" ? "dark" : "light";
    setTheme(validTheme);
    document.documentElement.setAttribute("data-theme", validTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = IsTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme); // Store in localStorage
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-full !p-1.5 !max-h-full !h-auto !min-w-0 !w-auto"
      onPress={() => toggleTheme()}
    >
      {IsTheme === "light" ? (
        <Sun className="h-5 w-5 text-orange-500" />
      ) : (
        <Moon className="h-5 w-5 text-gray-300" />
      )}
    </Button>
  );
};

export default ThemeSwitch;
