import React, { createContext, useContext, useState, ReactNode } from 'react';

// Enums
export enum TaskStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress", 
  COMPLETED = "completed",
  ON_HOLD = "on_hold",
  CANCELLED = "cancelled"
}

export enum TaskType {
  TASK = "task",
  EPIC = "epic", 
  MILESTONE = "milestone"
}

export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  team_members: string[];
  tags: string[];
  attachments: string[];
  comments: string[];
  tasks: Task[];
  sub_projects: Project[];
  parent_project?: Project;
  progress: number;
  updated_at?: string;
}

interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  task_type: TaskType;
  priority: Priority;
  project_id: string;
  start_date?: string;
  end_date?: string;
  assigned_to?: string;
  completion_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  setCurrentProject: (project: Project | null) => void;
  clearError: () => void;
  loadTasks: (projectId: string) => void;
  updateProject: (projectId: string, data: Partial<Project>) => void;
  createProject: (data: Omit<Project, 'id'>) => void;
  deleteProject: (projectId: string) => void;
  createTask: (data: Omit<Task, 'id'>) => void;
  updateTask: (taskId: string, data: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'Demo Proje 1',
      description: 'Bu bir demo projedir',
      status: TaskStatus.IN_PROGRESS,
      team_members: [],
      tags: [],
      attachments: [],
      comments: [],
      tasks: [],
      sub_projects: [],
      progress: 0
    },
    {
      id: '2', 
      name: 'Demo Proje 2',
      description: 'İkinci demo proje',
      status: TaskStatus.NOT_STARTED,
      team_members: [],
      tags: [],
      attachments: [],
      comments: [],
      tasks: [],
      sub_projects: [],
      progress: 0
    }
  ]);
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      name: 'Demo Task 1',
      description: 'İlk demo task',
      status: TaskStatus.IN_PROGRESS,
      task_type: TaskType.TASK,
      priority: Priority.HIGH,
      project_id: '1',
      completion_percentage: 75,
      assigned_to: 'Demo User'
    },
    {
      id: '2',
      name: 'Demo Task 2', 
      description: 'İkinci demo task',
      status: TaskStatus.COMPLETED,
      task_type: TaskType.TASK,
      priority: Priority.MEDIUM,
      project_id: '1',
      completion_percentage: 100
    },
    {
      id: '3',
      name: 'Demo Epic',
      description: 'Büyük özellik geliştirme',
      status: TaskStatus.IN_PROGRESS,
      task_type: TaskType.EPIC,
      priority: Priority.CRITICAL,
      project_id: '1',
      completion_percentage: 30
    },
    {
      id: '4',
      name: 'Demo Milestone',
      description: 'Önemli kilometre taşı',
      status: TaskStatus.NOT_STARTED,
      task_type: TaskType.MILESTONE,
      priority: Priority.HIGH,
      project_id: '2',
      completion_percentage: 0
    }
  ]);
  
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const clearError = () => {
    // Error clearing logic
  };

  const loadTasks = (projectId: string) => {
    // Load tasks for specific project
    console.log('Loading tasks for project:', projectId);
  };

  const updateProject = (projectId: string, data: Partial<Project>) => {
    // Update project logic
    console.log('Updating project:', projectId, data);
  };

  const createProject = (data: Omit<Project, 'id'>) => {
    // Create project logic
    console.log('Creating project:', data);
  };

  const deleteProject = (projectId: string) => {
    // Delete project logic
    console.log('Deleting project:', projectId);
  };

  const value: ProjectContextType = {
    projects,
    currentProject,
    tasks,
    isLoading,
    error,
    setCurrentProject,
    clearError,
    loadTasks,
    updateProject,
    createProject,
    deleteProject,
    createTask: (data: Omit<Task, 'id'>) => {
      // createTask logic
      console.log('Creating task:', data);
    },
    updateTask: (taskId: string, data: Partial<Task>) => {
      // updateTask logic
      console.log('Updating task:', taskId, data);
    },
    deleteTask: (taskId: string) => {
      // deleteTask logic
      console.log('Deleting task:', taskId);
    }
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};