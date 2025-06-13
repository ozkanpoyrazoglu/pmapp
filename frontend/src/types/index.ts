// Auth Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  full_name: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

// Project Types
export enum TaskStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum TaskType {
  TASK = 'task',
  EPIC = 'epic',
  MILESTONE = 'milestone'
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  task_type: TaskType;
  status: TaskStatus;
  priority: Priority;
  start_date?: string;
  end_date?: string;
  duration_days?: number;
  effort_hours?: number;
  completion_percentage: number;
  assigned_to?: string;
  dependencies: string[];
  parent_epic?: string;
  tags: string[];
  custom_fields: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  name: string;
  description?: string;
  task_type?: TaskType;
  status?: TaskStatus;
  priority?: Priority;
  start_date?: string;
  end_date?: string;
  duration_days?: number;
  effort_hours?: number;
  completion_percentage?: number;
  assigned_to?: string;
  dependencies?: string[];
  parent_epic?: string;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export interface TaskUpdate extends Partial<TaskCreate> {}

export interface Project {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: TaskStatus;
  team_members: string[];
  settings: Record<string, any>;
  owner: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: TaskStatus;
  team_members?: string[];
  settings?: Record<string, any>;
}

export interface ProjectUpdate extends Partial<ProjectCreate> {}

// Timeline Types
export interface TimelineTask {
  id: string;
  name: string;
  start_date?: string;
  end_date?: string;
  duration_days?: number;
  status: TaskStatus;
  completion_percentage: number;
  type: TaskType;
  dependencies: string[];
}

export interface TimelineDependency {
  from: string;
  to: string;
}

export interface TimelineData {
  project_id: string;
  tasks: TimelineTask[];
  dependencies: TimelineDependency[];
  milestones: TimelineTask[];
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  currentProject: Project | null;
  projects: Project[];
  tasks: Task[];
  loading: LoadingState;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'date' | 'number';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

// Status Colors
export const StatusColors = {
  [TaskStatus.NOT_STARTED]: 'text-gray-600 bg-gray-100',
  [TaskStatus.IN_PROGRESS]: 'text-blue-600 bg-blue-100',
  [TaskStatus.COMPLETED]: 'text-green-600 bg-green-100',
  [TaskStatus.ON_HOLD]: 'text-yellow-600 bg-yellow-100',
  [TaskStatus.CANCELLED]: 'text-red-600 bg-red-100'
};

export const PriorityColors = {
  [Priority.LOW]: 'text-gray-600 bg-gray-100',
  [Priority.MEDIUM]: 'text-blue-600 bg-blue-100',
  [Priority.HIGH]: 'text-orange-600 bg-orange-100',
  [Priority.CRITICAL]: 'text-red-600 bg-red-100'
};

export const TaskTypeColors = {
  [TaskType.TASK]: 'text-blue-600 bg-blue-100',
  [TaskType.EPIC]: 'text-purple-600 bg-purple-100',
  [TaskType.MILESTONE]: 'text-green-600 bg-green-100'
};