export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'deleted';
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type AppStackParamList = {
  TaskList: undefined;
  AddEditTask: {taskId?: string} | undefined;
};

export type SortBy = 'createdAt' | 'dueDate' | 'title';

export type TaskFilter = 'all' | 'active' | 'completed';
