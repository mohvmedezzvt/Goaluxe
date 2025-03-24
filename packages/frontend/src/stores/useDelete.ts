import { create } from "zustand";
interface DeleteState {
  isDeleting: {
    goal?: {
      goalId: string | null;
    };
    subtask?: {
      subtaskId: string | null;
      goalId: string | null;
    };
  };
  setDeleteGoal: (id: string | null) => void;
  setDeleteSubtask: (taskId: string | null, goalId: string | null) => void;
  clearDeletes: () => void;
}

const useDelete = create<DeleteState>((set) => ({
  isDeleting: {},
  setDeleteGoal: (id) => {
    set(() => ({
      isDeleting: {
        goal: {
          goalId: id,
        },
      },
    }));
  },
  setDeleteSubtask: (taskId, goalId) => {
    set(() => ({
      isDeleting: {
        subtask: {
          subtaskId: taskId,
          goalId: goalId,
        },
      },
    }));
  },
  clearDeletes: () => set({ isDeleting: {} }),
}));

export default useDelete;
