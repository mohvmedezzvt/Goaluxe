import { create } from "zustand";
interface ThemeState {
  IsTheme: "dark" | "light";
  setTheme: (value: "dark" | "light") => void;
}

const useEdit = create<ThemeState>((set) => ({
  IsTheme: "light",
  setTheme: (value) => set({ IsTheme: value }),
}));

export default useEdit;
