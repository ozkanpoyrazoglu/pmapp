import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  LoginCredentials,
  RegisterData,
  AuthToken,
  Project,
  ProjectCreate,
  ProjectUpdate,
  Task,
  TaskCreate,
  TaskUpdate,
  TimelineData
} from '../types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth API
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response: AxiosResponse<AuthToken> = await this.client.post(
      '/api/auth/login',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async register(userData: RegisterData): Promise<User> {
    const response: AxiosResponse<User> = await this.client.post(
      '/api/auth/register',
      userData
    );
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.client.get('/api/auth/me');
    return response.data;
  }

  // Projects API
  async getProjects(skip = 0, limit = 100): Promise<Project[]> {
    const response: AxiosResponse<Project[]> = await this.client.get(
      `/api/projects?skip=${skip}&limit=${limit}`
    );
    return response.data;
  }

  async getProject(projectId: string): Promise<Project> {
    const response: AxiosResponse<Project> = await this.client.get(
      `/api/projects/${projectId}`
    );
    return response.data;
  }

  async createProject(projectData: ProjectCreate): Promise<Project> {
    const response: AxiosResponse<Project> = await this.client.post(
      '/api/projects',
      projectData
    );
    return response.data;
  }

  async updateProject(
    projectId: string,
    projectData: ProjectUpdate
  ): Promise<Project> {
    const response: AxiosResponse<Project> = await this.client.put(
      `/api/projects/${projectId}`,
      projectData
    );
    return response.data;
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.client.delete(`/api/projects/${projectId}`);
  }

  // Tasks API
  async getTasks(projectId: string, params?: {
    task_type?: string;
    status?: string;
  }): Promise<Task[]> {
    const queryParams = new URLSearchParams();
    if (params?.task_type) queryParams.append('task_type', params.task_type);
    if (params?.status) queryParams.append('status', params.status);

    const response: AxiosResponse<Task[]> = await this.client.get(
      `/api/projects/${projectId}/tasks?${queryParams.toString()}`
    );
    return response.data;
  }

  async getTask(projectId: string, taskId: string): Promise<Task> {
    const response: AxiosResponse<Task> = await this.client.get(
      `/api/projects/${projectId}/tasks/${taskId}`
    );
    return response.data;
  }

  async createTask(projectId: string, taskData: TaskCreate): Promise<Task> {
    const response: AxiosResponse<Task> = await this.client.post(
      `/api/projects/${projectId}/tasks`,
      taskData
    );
    return response.data;
  }

  async updateTask(
    projectId: string,
    taskId: string,
    taskData: TaskUpdate
  ): Promise<Task> {
    const response: AxiosResponse<Task> = await this.client.put(
      `/api/projects/${projectId}/tasks/${taskId}`,
      taskData
    );
    return response.data;
  }

  async deleteTask(projectId: string, taskId: string): Promise<void> {
    await this.client.delete(`/api/projects/${projectId}/tasks/${taskId}`);
  }

  // Timeline API
  async getProjectTimeline(projectId: string): Promise<TimelineData> {
    const response: AxiosResponse<TimelineData> = await this.client.get(
      `/api/projects/${projectId}/timeline`
    );
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;