import useTheme from "@/stores/useTheme";
import { Button } from "@heroui/react";
import { Sun, Moon } from "lucide-react";
import React from "react";

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-full !p-1.5 !max-h-full !h-auto !min-w-0 !w-auto"
      onPress={() => toggleTheme()}
    >
      {theme === "light" ? (
        <Sun className="h-5 w-5 text-orange-500" />
      ) : (
        <Moon className="h-5 w-5 text-gray-300" />
      )}
    </Button>
  );
};

export default ThemeSwitch;
