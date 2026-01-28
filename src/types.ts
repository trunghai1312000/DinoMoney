export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  status: string; // column id
  boardId: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  startDate?: string;
  description?: string;
  color?: string;
  createdAt: string;
  subtasks?: Subtask[];
}

export interface Column {
  id: string;
  title: string;
  color: string;
}

export interface Board {
  id: string;
  title: string;
  isDefault: boolean;
  columns: Column[];
}

export interface UserSettings {
  focusDuration: number; // Phút (Mặc định 25)
  weeklyGoal: number; // Giờ (Mặc định 40)
  highPerformance: boolean; // Tắt blur/animation
  sound: boolean;
  notifications: boolean;
}

export interface UserProfile {
  username: string;
  bio?: string;
  avatarUrl: string;
  password?: string;
  joinedAt: string;
  isSetup: boolean;
  settings: UserSettings; // Thêm setting vào profile
}