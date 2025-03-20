import { create } from "zustand";
interface DeleteState {
  isDeleting: Record<string, string | null>;
  setDelete: (category: string, id: string | null) => void;
}

const useDelete = create<DeleteState>((set) => ({
  isDeleting: {},
  setDelete: (category, id) => {
    set((state) => ({
      isDeleting: {
        ...state.isDeleting,
        [category]: id,
      },
    }));
  },
}));

export default useDelete;
