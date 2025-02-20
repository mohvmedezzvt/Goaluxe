import { create } from "zustand";
interface DeleteState {
  isDeleting: string | null;
  setDelete: (value: string | null) => void;
}

const useDelete = create<DeleteState>((set) => ({
  isDeleting: null,
  setDelete: (value) => set({ isDeleting: value }),
}));

export default useDelete;
