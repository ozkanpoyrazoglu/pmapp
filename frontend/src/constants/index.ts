// frontend/src/constants/index.ts

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// Application Configuration
export const APP_CONFIG = {
  NAME: process.env.REACT_APP_APP_NAME || 'Project Manager',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  DEBUG: process.env.REACT_APP_DEBUG === 'true',
} as const;

// Task Status Options
export const TASK_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Başlamadı', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
  { value: 'on_hold', label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'cancelled', label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
] as const;

// Task Priority Options
export const TASK_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Düşük', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Orta', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'Yüksek', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Kritik', color: 'bg-red-100 text-red-800' },
] as const;

// Task Type Options
export const TASK_TYPE_OPTIONS = [
  { value: 'task', label: 'Görev' },
  { value: 'epic', label: 'Epic' },
  { value: 'milestone', label: 'Kilometre Taşı' },
] as const;

// Project Status Options
export const PROJECT_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Başlamadı', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
  { value: 'on_hold', label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'cancelled', label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
] as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'DD.MM.YYYY',
  LONG: 'DD MMMM YYYY',
  WITH_TIME: 'DD.MM.YYYY HH:mm',
  TIME_ONLY: 'HH:mm',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  PROJECT_NAME_MIN_LENGTH: 2,
  PROJECT_NAME_MAX_LENGTH: 200,
  TASK_NAME_MIN_LENGTH: 2,
  TASK_NAME_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 1000,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Routes
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:projectId',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.',
  UNAUTHORIZED: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
  FORBIDDEN: 'Bu işlem için yetkiniz bulunmuyor.',
  NOT_FOUND: 'Aradığınız kaynak bulunamadı.',
  SERVER_ERROR: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
  VALIDATION_ERROR: 'Girdiğiniz bilgilerde hata var. Lütfen kontrol edin.',
  GENERIC_ERROR: 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Başarıyla giriş yaptınız.',
  LOGOUT_SUCCESS: 'Çıkış yapıldı.',
  PROJECT_CREATED: 'Proje başarıyla oluşturuldu.',
  PROJECT_UPDATED: 'Proje başarıyla güncellendi.',
  PROJECT_DELETED: 'Proje başarıyla silindi.',
  TASK_CREATED: 'Görev başarıyla oluşturuldu.',
  TASK_UPDATED: 'Görev başarıyla güncellendi.',
  TASK_DELETED: 'Görev başarıyla silindi.',
} as const;

// Feature Flags (for future features)
export const FEATURE_FLAGS = {
  ENABLE_NOTIFICATIONS: false,
  ENABLE_DARK_MODE: false,
  ENABLE_ANALYTICS: false,
  ENABLE_FILE_UPLOAD: false,
  ENABLE_REAL_TIME: false,
} as const;