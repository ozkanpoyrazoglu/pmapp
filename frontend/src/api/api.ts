// frontend/src/api/api.ts

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  owner: string;
  team_members: string[];
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  created_by: string;
  task_type: 'task' | 'epic' | 'milestone';
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
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
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  name: string; // Required field
  description?: string;
  task_type?: 'task' | 'epic' | 'milestone';
  status?: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
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

export interface TaskUpdate {
  name?: string;
  description?: string;
  task_type?: 'task' | 'epic' | 'milestone';
  status?: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
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

export interface LoginData {
  access_token: string;
  token_type: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('access_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<LoginData> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const url = `${API_BASE_URL}/api/auth/login`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Login failed');
    }

    return response.json();
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  // Project endpoints
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/api/projects/');
  }

  async getProject(projectId: string): Promise<Project> {
    return this.request<Project>(`/api/projects/${projectId}`);
  }

  async createProject(projectData: Partial<Project>): Promise<Project> {
    return this.request<Project>('/api/projects/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(projectId: string, projectData: Partial<Project>): Promise<Project> {
    return this.request<Project>(`/api/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(projectId: string): Promise<void> {
    return this.request<void>(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  // Task endpoints
  async getProjectTasks(
    projectId: string,
    params?: {
      task_type?: 'task' | 'epic' | 'milestone';
      status?: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
    }
  ): Promise<Task[]> {
    const searchParams = new URLSearchParams();
    if (params?.task_type) searchParams.append('task_type', params.task_type);
    if (params?.status) searchParams.append('status', params.status);
    
    const queryString = searchParams.toString();
    const url = `/api/projects/${projectId}/tasks${queryString ? `?${queryString}` : ''}`;
    
    return this.request<Task[]>(url);
  }

  async getTask(projectId: string, taskId: string): Promise<Task> {
    return this.request<Task>(`/api/projects/${projectId}/tasks/${taskId}`);
  }

  async createTask(projectId: string, taskData: TaskCreate): Promise<Task> {
    return this.request<Task>(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(
    projectId: string,
    taskId: string,
    taskData: TaskUpdate
  ): Promise<Task> {
    return this.request<Task>(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(projectId: string, taskId: string): Promise<void> {
    return this.request<void>(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async getProjectTimeline(projectId: string): Promise<any> {
    return this.request<any>(`/api/projects/${projectId}/timeline`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;