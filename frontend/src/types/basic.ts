// Basic types for initial build
export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
}