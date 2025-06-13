import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import { TaskStatus, TaskType, StatusColors, TaskTypeColors } from '../types';
import {
  CalendarDaysIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const TimelinePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    projects,
    currentProject,
    tasks,
    timeline,
    setCurrentProject,
    loadTasks,
    loadTimeline,
    isLoading
  } = useProject();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  useEffect(() => {
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setCurrentProject(project);
        loadTasks(projectId);
        loadTimeline(projectId);
      }
    }
  }, [projectId, projects, setCurrentProject, loadTasks, loadTimeline]);

  // Proje bulunamadıysa projects page'e yönlendir
  if (!isLoading && projectId && !currentProject && projects.length > 0) {
    return <Navigate to="/projects" replace />;
  }

  // Filtreleme
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesType = typeFilter === 'all' || task.task_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Timeline için tarih aralığı hesaplama
  const getDateRange = () => {
    if (filteredTasks.length === 0) {
      const now = new Date();
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 3, 0)
      };
    }

    const dates = filteredTasks
      .flatMap(task => [task.start_date, task.end_date])
      .filter(date => date)
      .map(date => new Date(date!));

    if (dates.length === 0) {
      const now = new Date();
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 3, 0)
      };
    }

    const start = new Date(Math.min(...dates.map(d => d.getTime())));
    const end = new Date(Math.max(...dates.map(d => d.getTime())));

    // Başlangıcı ayın başına, bitişi ayın sonuna ayarla
    start.setDate(1);
    end.setMonth(end.getMonth() + 1, 0);

    return { start, end };
  };

  const { start: rangeStart, end: rangeEnd } = getDateRange();

  // Timeline grid için tarih dizisi oluştur
  const generateTimelineGrid = () => {
    const grid = [];
    const current = new Date(rangeStart);

    if (viewMode === 'month') {
      while (current <= rangeEnd) {
        grid.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
      }
    } else {
      while (current <= rangeEnd) {
        grid.push(new Date(current));
        current.setDate(current.getDate() + 7);
      }
    }

    return grid;
  };

  const timelineGrid = generateTimelineGrid();

  // Task'ın timeline'daki pozisyonunu hesapla
  const getTaskPosition = (task: any) => {
    if (!task.start_date || !task.end_date) return null;

    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.end_date);
    const totalDays = Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const startOffset = Math.ceil((taskStart.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const leftPercent = Math.max(0, (startOffset / totalDays) * 100);
    const widthPercent = Math.min(100 - leftPercent, (duration / totalDays) * 100);

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`
    };
  };

  const getStatusText = (status: TaskStatus): string => {
    const statusMap = {
      [TaskStatus.NOT_STARTED]: 'Başlamadı',
      [TaskStatus.IN_PROGRESS]: 'Devam Ediyor',
      [TaskStatus.COMPLETED]: 'Tamamlandı',
      [TaskStatus.ON_HOLD]: 'Beklemede',
      [TaskStatus.CANCELLED]: 'İptal Edildi'
    };
    return statusMap[status] || status;
  };

  const getTypeText = (type: TaskType): string => {
    const typeMap = {
      [TaskType.TASK]: 'Task',
      [TaskType.EPIC]: 'Epic',
      [TaskType.MILESTONE]: 'Milestone'
    };
    return typeMap[type] || type;
  };

  if (isLoading && !currentProject) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentProject?.name} - Timeline
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Gantt benzeri proje zaman çizelgesi
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'month' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Aylık
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'week' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Haftalık
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Task ara..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
            <select
              className="input w-auto min-w-[120px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
            >
              <option value="all">Tüm Durumlar</option>
              {Object.values(TaskStatus).map(status => (
                <option key={status} value={status}>{getStatusText(status)}</option>
              ))}
            </select>

            <select
              className="input w-auto min-w-[120px]"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TaskType | 'all')}
            >
              <option value="all">Tüm Tipler</option>
              {Object.values(TaskType).map(type => (
                <option key={type} value={type}>{getTypeText(type)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {filteredTasks.length === 0 ? (
        <div className="card text-center py-12">
          <CalendarDaysIcon className="mx-auto h-24 w-24 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
              ? 'Task bulunamadı' 
              : 'Timeline için task yok'}
          </h3>
          <p className="mt-2 text-gray-500">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Farklı filtreler deneyebilirsiniz.'
              : 'Tarih aralığı bulunan tasklar oluşturun.'
            }
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            {/* Timeline Header */}
            <div className="min-w-[800px]">
              {/* Tarih başlıkları */}
              <div className="flex border-b border-gray-200">
                <div className="w-64 flex-shrink-0 p-4 bg-gray-50 border-r border-gray-200">
                  <span className="font-medium text-gray-900">Task</span>
                </div>
                <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${timelineGrid.length}, 1fr)` }}>
                  {timelineGrid.map((date, index) => (
                    <div
                      key={index}
                      className="p-4 text-center text-sm font-medium text-gray-700 border-r border-gray-200 bg-gray-50"
                    >
                      {viewMode === 'month' 
                        ? date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })
                        : date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
                      }
                    </div>
                  ))}
                </div>
              </div>

              {/* Task rows */}
              <div className="divide-y divide-gray-200">
                {filteredTasks.map((task) => {
                  const position = getTaskPosition(task);
                  
                  return (
                    <div key={task.id} className="flex hover:bg-gray-50">
                      {/* Task Info */}
                      <div className="w-64 flex-shrink-0 p-4 border-r border-gray-200">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`badge text-xs ${TaskTypeColors[task.task_type]}`}>
                              {getTypeText(task.task_type)}
                            </span>
                            <span className={`badge text-xs ${StatusColors[task.status]}`}>
                              {getStatusText(task.status)}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {task.name}
                          </h4>
                          {task.assigned_to && (
                            <p className="text-xs text-gray-500">
                              {task.assigned_to}
                            </p>
                          )}
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            {task.start_date && (
                              <span>{new Date(task.start_date).toLocaleDateString('tr-TR')}</span>
                            )}
                            {task.start_date && task.end_date && <span>-</span>}
                            {task.end_date && (
                              <span>{new Date(task.end_date).toLocaleDateString('tr-TR')}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Timeline Bar */}
                      <div className="flex-1 relative p-4">
                        {position && (
                          <div
                            className={`absolute top-1/2 transform -translate-y-1/2 h-6 rounded-md flex items-center px-2 ${
                              task.task_type === TaskType.MILESTONE 
                                ? 'bg-green-500' 
                                : task.status === TaskStatus.COMPLETED
                                ? 'bg-green-400'
                                : task.status === TaskStatus.IN_PROGRESS
                                ? 'bg-blue-400'
                                : 'bg-gray-300'
                            }`}
                            style={position}
                          >
                            {/* Progress indicator */}
                            {task.completion_percentage > 0 && task.task_type !== TaskType.MILESTONE && (
                              <div
                                className="absolute left-0 top-0 h-full bg-green-600 rounded-md opacity-75"
                                style={{ width: `${task.completion_percentage}%` }}
                              />
                            )}
                            
                            <span className="relative text-xs text-white font-medium truncate z-10">
                              {task.task_type === TaskType.MILESTONE ? '♦' : `${task.completion_percentage}%`}
                            </span>
                          </div>
                        )}
                        
                        {!position && (
                          <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-xs text-gray-400">
                            Tarih aralığı belirtilmemiş
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Açıklama</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span className="text-gray-600">Başlamadı</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-400 rounded"></div>
            <span className="text-gray-600">Devam Ediyor</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span className="text-gray-600">Tamamlandı</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">Milestone</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;