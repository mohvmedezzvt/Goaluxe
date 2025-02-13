export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  status: 'active' | 'completed' | 'archived';
  createdAt: Date;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  createdBy?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
} 