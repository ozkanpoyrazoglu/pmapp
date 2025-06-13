// Utility Functions

import { TaskStatus, TaskType, Priority } from '../types';

/**
 * Date formatting utilities
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('tr-TR');
};

export const formatDateTime = (date: string | Date): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('tr-TR');
};

export const formatRelativeTime = (date: string | Date): string => {
  if (!date) return '';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 0 ? 'Şimdi' : `${diffMinutes} dakika önce`;
    }
    return `${diffHours} saat önce`;
  } else if (diffDays === 1) {
    return 'Dün';
  } else if (diffDays < 7) {
    return `${diffDays} gün önce`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} hafta önce`;
  } else {
    return formatDate(date);
  }
};

export const isOverdue = (endDate: string | Date | undefined, status: TaskStatus): boolean => {
  if (!endDate || status === TaskStatus.COMPLETED || status === TaskStatus.CANCELLED) {
    return false;
  }
  return new Date(endDate) < new Date();
};

export const getDaysUntilDeadline = (endDate: string | Date | undefined): number | null => {
  if (!endDate) return null;
  
  const now = new Date();
  const deadline = new Date(endDate);
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * String utilities
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Array utilities
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const uniqueBy = <T>(array: T[], key: keyof T): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

/**
 * Validation utilities
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidDate = (date: string): boolean => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false;
  return new Date(startDate) <= new Date(endDate);
};

/**
 * Local storage utilities
 */
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
};

/**
 * Color utilities
 */
export const getStatusColor = (status: TaskStatus): string => {
  const colors = {
    [TaskStatus.NOT_STARTED]: '#6B7280', // gray-500
    [TaskStatus.IN_PROGRESS]: '#3B82F6', // blue-500
    [TaskStatus.COMPLETED]: '#10B981', // green-500
    [TaskStatus.ON_HOLD]: '#F59E0B', // yellow-500
    [TaskStatus.CANCELLED]: '#EF4444' // red-500
  };
  return colors[status] || colors[TaskStatus.NOT_STARTED];
};

export const getPriorityColor = (priority: Priority): string => {
  const colors = {
    [Priority.LOW]: '#6B7280', // gray-500
    [Priority.MEDIUM]: '#3B82F6', // blue-500
    [Priority.HIGH]: '#F97316', // orange-500
    [Priority.CRITICAL]: '#EF4444' // red-500
  };
  return colors[priority] || colors[Priority.MEDIUM];
};

export const getTaskTypeColor = (type: TaskType): string => {
  const colors = {
    [TaskType.TASK]: '#3B82F6', // blue-500
    [TaskType.EPIC]: '#8B5CF6', // purple-500
    [TaskType.MILESTONE]: '#10B981' // green-500
  };
  return colors[type] || colors[TaskType.TASK];
};

/**
 * Progress calculation utilities
 */
export const calculateProjectProgress = (tasks: Array<{ status: TaskStatus }>): number => {
  if (tasks.length === 0) return 0;
  
  const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
  return Math.round((completedTasks / tasks.length) * 100);
};

export const calculateEpicProgress = (tasks: Array<{ completion_percentage: number }>): number => {
  if (tasks.length === 0) return 0;
  
  const totalProgress = tasks.reduce((sum, task) => sum + task.completion_percentage, 0);
  return Math.round(totalProgress / tasks.length);
};

/**
 * URL utilities
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

export const parseQueryString = (search: string): Record<string, string> => {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
};

/**
 * File utilities
 */
export const downloadJSON = (data: any, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const downloadCSV = (data: Array<Record<string, any>>, filename: string): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Debounce utility
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Theme utilities
 */
export const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyTheme = (theme: 'light' | 'dark' | 'auto'): void => {
  const root = document.documentElement;
  
  if (theme === 'auto') {
    theme = getSystemTheme();
  }
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  storage.set('theme', theme);
};