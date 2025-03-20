import { create } from "zustand";

interface EditState {
  isEditing: Record<string, string | null>; // { category: id }
  setEdit: (category: string, id: string | null) => void;
}

const useEdit = create<EditState>((set) => ({
  isEditing: {},

  setEdit: (category, id) =>
    set((state) => ({
      isEditing: {
        ...state.isEditing,
        [category]: id,
      },
    })),
}));

export default useEdit;
