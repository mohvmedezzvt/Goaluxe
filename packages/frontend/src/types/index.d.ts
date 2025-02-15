interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
}

interface Goal {
  _id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  status: "active" | "completed" | "archived";
  createdAt: Date;
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
