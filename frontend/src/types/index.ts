// frontend/src/types/index.ts

// Re-export types from API
export type {
  User,
  Project,
  Task,
  TaskCreate,
  TaskUpdate,
  LoginData
} from '../api/api';

// Additional shared types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationInfo {
  total: number;
  skip: number;
  limit: number;
  has_next: boolean;
  has_previous: boolean;
  page: number;
  total_pages: number;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  type?: string;
  assigned_to?: string;
  priority?: string;
  tags?: string[];
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ApiError {
  detail: string;
  status_code: number;
}