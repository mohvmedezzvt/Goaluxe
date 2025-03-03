import { create } from "zustand";
import { persist } from "zustand/middleware"; // Import the persist middleware

interface ThemeState {
  IsTheme: "dark" | "light";
  setTheme: (value: "dark" | "light") => void;
}

const useTheme = create<ThemeState>()(
  persist(
    // Wrap the store with persist
    (set) => ({
      IsTheme: "light", // Default theme
      setTheme: (value) => set({ IsTheme: value }), // Function to update the theme
    }),
    {
      name: "theme-storage", // Unique name for localStorage
    }
  )
);

export default useTheme;
