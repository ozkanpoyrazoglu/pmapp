// frontend/src/components/TaskList.tsx

import React, { useState } from 'react';
import { apiClient, Task } from '../api/api';

interface TaskListProps {
  tasks: Task[];
  projectId: string;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
  onFilterChange: (filter: {
    type?: 'task' | 'epic' | 'milestone';
    status?: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  }) => void;
  currentFilter: {
    type?: 'task' | 'epic' | 'milestone';
    status?: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  };
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  projectId,
  onTaskUpdated,
  onTaskDeleted,
  onFilterChange,
  currentFilter,
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Status güncelleme
  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    setLoading(taskId);
    setError(null);

    try {
      const updatedTask = await apiClient.updateTask(projectId, taskId, {
        status: newStatus,
        completion_percentage: newStatus === 'completed' ? 100 : undefined,
      });
      onTaskUpdated(updatedTask);
    } catch (err) {
      setError(`Status güncellenirken hata: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
    } finally {
      setLoading(null);
    }
  };

  // Görev silme
  const handleDeleteTask = async (taskId: string, taskName: string) => {
    if (!window.confirm(`"${taskName}" görevini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    setLoading(taskId);
    setError(null);

    try {
      await apiClient.deleteTask(projectId, taskId);
      onTaskDeleted(taskId);
    } catch (err) {
      setError(`Görev silinirken hata: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
      setLoading(null);
    }
  };

  // Status metinleri ve renkleri
  const getStatusInfo = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return { text: 'Tamamlandı', color: 'bg-green-100 text-green-800' };
      case 'in_progress':
        return { text: 'Devam Ediyor', color: 'bg-blue-100 text-blue-800' };
      case 'on_hold':
        return { text: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' };
      case 'cancelled':
        return { text: 'İptal Edildi', color: 'bg-red-100 text-red-800' };
      default:
        return { text: 'Başlamadı', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Priority renkleri
  const getPriorityInfo = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical':
        return { text: 'Kritik', color: 'bg-red-100 text-red-800' };
      case 'high':
        return { text: 'Yüksek', color: 'bg-orange-100 text-orange-800' };
      case 'medium':
        return { text: 'Orta', color: 'bg-blue-100 text-blue-800' };
      default:
        return { text: 'Düşük', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Task tipi metinleri
  const getTaskTypeText = (type: Task['task_type']) => {
    switch (type) {
      case 'epic':
        return 'Epic';
      case 'milestone':
        return 'Kilometre Taşı';
      default:
        return 'Görev';
    }
  };

  // Filter options
  const taskTypeOptions = [
    { value: '', label: 'Tüm Tipler' },
    { value: 'task', label: 'Görev' },
    { value: 'epic', label: 'Epic' },
    { value: 'milestone', label: 'Kilometre Taşı' },
  ];

  const statusOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'not_started', label: 'Başlamadı' },
    { value: 'in_progress', label: 'Devam Ediyor' },
    { value: 'completed', label: 'Tamamlandı' },
    { value: 'on_hold', label: 'Beklemede' },
    { value: 'cancelled', label: 'İptal Edildi' },
  ];

  const statusQuickActions = [
    { value: 'not_started', label: 'Başlat', color: 'bg-gray-600' },
    { value: 'in_progress', label: 'Devam', color: 'bg-blue-600' },
    { value: 'completed', label: 'Tamamla', color: 'bg-green-600' },
    { value: 'on_hold', label: 'Beklet', color: 'bg-yellow-600' },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        {/* Header ve Filtreler */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Görevler ({tasks.length})
          </h3>
          
          <div className="flex items-center space-x-3">
            {/* Tip Filtresi */}
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={currentFilter.type || ''}
              onChange={(e) => onFilterChange({
                ...currentFilter,
                type: e.target.value as any || undefined,
              })}
            >
              {taskTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Durum Filtresi */}
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={currentFilter.status || ''}
              onChange={(e) => onFilterChange({
                ...currentFilter,
                status: e.target.value as any || undefined,
              })}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Task Listesi */}
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Görev bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              Bu filtrelere uygun görev bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const statusInfo = getStatusInfo(task.status);
              const priorityInfo = getPriorityInfo(task.priority);
              const isLoading = loading === task.id;

              return (
                <div
                  key={task.id}
                  className={`border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                    isLoading ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Task Header */}
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {task.name}
                        </h4>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {getTaskTypeText(task.task_type)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                          {priorityInfo.text}
                        </span>
                      </div>

                      {/* Task Description */}
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2 overflow-hidden">
                          <span className="block truncate">{task.description}</span>
                        </p>
                      )}

                      {/* Task Details */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {task.assigned_to && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            {task.assigned_to}
                          </span>
                        )}
                        
                        {task.start_date && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {new Date(task.start_date).toLocaleDateString('tr-TR')}
                          </span>
                        )}
                        
                        {task.duration_days && (
                          <span>{task.duration_days} gün</span>
                        )}
                        
                        {task.effort_hours && (
                          <span>{task.effort_hours} saat</span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {task.completion_percentage > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">İlerleme</span>
                            <span className="text-xs text-gray-500">%{task.completion_percentage}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${task.completion_percentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {task.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {/* Quick Status Actions */}
                      <div className="flex items-center space-x-1">
                        {statusQuickActions
                          .filter(action => action.value !== task.status)
                          .slice(0, 2)
                          .map((action) => (
                          <button
                            key={action.value}
                            onClick={() => handleStatusChange(task.id, action.value as Task['status'])}
                            disabled={isLoading}
                            className={`${action.color} text-white px-2 py-1 rounded text-xs hover:opacity-80 disabled:opacity-50`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>

                      {/* More Actions Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => handleDeleteTask(task.id, task.name)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                          title="Görevi sil"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;