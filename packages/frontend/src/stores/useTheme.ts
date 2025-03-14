// stores/useTheme.ts
import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
}

// Initialize with a default theme for SSR
const useTheme = create<ThemeStore>((set) => ({
  theme: "light", // Default theme for SSR
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme); // Save to localStorage
      return { theme: newTheme };
    });
  },
}));

// Sync the theme from localStorage on the client side
if (typeof window !== "undefined") {
  const savedTheme = localStorage.getItem("theme") as Theme | null;
  if (savedTheme) {
    useTheme.setState({ theme: savedTheme });
  }
}

export default useTheme;
