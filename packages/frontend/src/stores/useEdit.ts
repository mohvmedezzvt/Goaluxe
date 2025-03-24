import { create } from "zustand";

interface EditState {
  isEditing: {
    goal?: {
      goalId: string | null;
    };
    subtask?: {
      subtaskId: string | null;
      goalId: string | null;
    };
  };
  setEditGoal: (id: string | null) => void;
  setEditSubtask: (taskId: string | null, goalId: string | null) => void;
  clearEdits: () => void;
}

const useEdit = create<EditState>((set) => ({
  isEditing: {},

  setEditGoal: (id) =>
    set(() => ({
      isEditing: {
        goal: {
          goalId: id,
        },
      },
    })),
  setEditSubtask: (taskId, goalId) =>
    set(() => ({
      isEditing: {
        subtask: {
          subtaskId: taskId,
          goalId: goalId,
        },
      },
    })),
  clearEdits: () => set({ isEditing: {} }),
}));

export default useEdit;
