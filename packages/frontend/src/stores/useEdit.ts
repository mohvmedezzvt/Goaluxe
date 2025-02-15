import { create } from "zustand";
interface EditState {
  isEditing: string | null;
  setEdit: (value: string | null) => void;
}

const useEdit = create<EditState>((set) => ({
  isEditing: null,
  setEdit: (value) => set({ isEditing: value }),
}));

export default useEdit;
