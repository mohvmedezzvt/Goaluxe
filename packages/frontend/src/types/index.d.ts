interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
}

interface Goal {
  id: string;
  title: string;
  description: string;
  reward: string | null;
  dueDate: Date | string;
  progress: number;
  status: "active" | "completed" | "cancelled";
  createdAt: Date | string;
}
interface subtask {
  id: string;
  title: string;
  completed: boolean;
}
interface Analytics {
  activeCount: number;
  completedCount: number;
  overallProgress: number;
  dueSoonCount: number;
  dueSoonTasks: Goal[];
}
interface URLParams {
  title: string | null;
  page: number;
  order: "desc" | "asc";
  status: string | null;
  sortBy: "title" | "dueDate" | "progress" | null;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  createdBy?: string;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface AuthFormProps {
  mode: "login" | "register";
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  general?: string;
}

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
type LoginResponse = {
  token: string;
  user: User;
};

type RegisterResponse = LoginResponse;
