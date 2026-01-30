export interface UserSettings {
  focusDuration?: number; // Cài đặt mặc định (phút)
  weeklyGoal?: number;    // Mục tiêu giờ/tuần
  highPerformance?: boolean;
  sound?: boolean;
  notifications?: boolean;
  wallpaper?: {
      url: string;
      type: 'image' | 'video';
  };
}

export interface UserProfile {
  id?: number;
  username: string;
  bio?: string;
  avatarUrl?: string;
  password?: string;
  joinedAt: string;
  settings?: UserSettings;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  status: string; // 'todo' | 'inprogress' | 'waiting' | 'done'
  boardId: string;
  dueDate?: string;
  startDate?: string;
  description?: string;
  color?: string;
  subtasks?: Subtask[];
  createdAt: string;
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

export interface Note {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  colorBg: string;
  colorBorder: string;
  textColor: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  rotate: number;
}

// MỚI: Interface cho phiên làm việc tập trung
export interface FocusSession {
  id: string;
  duration: number; // Số phút
  completedAt: string; // ISO Date
}