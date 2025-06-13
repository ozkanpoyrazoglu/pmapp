import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import { Task, TaskCreate, TaskStatus, TaskType, Priority, StatusColors, TaskTypeColors, PriorityColors } from '../types';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import TaskFormModal from '../components/tasks/TaskFormModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

type SortField = 'name' | 'status' | 'priority' | 'created_at' | 'end_date';
type SortDirection = 'asc' | 'desc';

const TasksPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    projects,
    currentProject,
    tasks,
    setCurrentProject,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    isLoading
  } = useProject();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TaskType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setCurrentProject(project);
        loadTasks(projectId);
      }
    }
  }, [projectId, projects, setCurrentProject, loadTasks]);

  // Proje bulunamadıysa projects page'e yönlendir
  if (!isLoading && projectId && !currentProject && projects.length > 0) {
    return <Navigate to="/projects" replace />;
  }

  // Filtreleme ve sıralama
  const filteredAndSortedTasks = tasks
    .filter((task) => {
      const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesType = typeFilter === 'all' || task.task_type === typeFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesType && matchesPriority;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'created_at' || sortField === 'end_date') {
        aValue = new Date(aValue || '').getTime();
        bValue = new Date(bValue || '').getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreateTask = async (taskData: TaskCreate) => {
    if (!projectId) return;
    
    try {
      await createTask({ ...taskData, project_id: projectId });
      setIsModalOpen(false);
    } catch (error) {
      // Error handling is done in context
    }
  };

  const handleUpdateTask = async (taskData: TaskCreate) => {
    if (!editingTask || !projectId) return;
    
    try {
      await updateTask(projectId, editingTask.id, taskData);
      setEditingTask(null);
      setIsModalOpen(false);
    } catch (error) {
      // Error handling is done in context
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask || !projectId) return;
    
    try {
      await deleteTask(projectId, deletingTask.id);
      setDeletingTask(null);
    } catch (error) {
      // Error handling is done in context
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
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

  const getPriorityText = (priority: Priority): string => {
    const priorityMap = {
      [Priority.LOW]: 'Düşük',
      [Priority.MEDIUM]: 'Orta',
      [Priority.HIGH]: 'Yüksek',
      [Priority.CRITICAL]: 'Kritik'
    };
    return priorityMap[priority] || priority;
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
            {currentProject?.name} - Tasklar
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Proje tasklarını yönetin ve takip edin
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary mt-4 sm:mt-0"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Yeni Task
        </button>
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
          <div className="flex flex-wrap gap-4">
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

            <select
              className="input w-auto min-w-[120px]"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
            >
              <option value="all">Tüm Öncelikler</option>
              {Object.values(Priority).map(priority => (
                <option key={priority} value={priority}>{getPriorityText(priority)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      {filteredAndSortedTasks.length === 0 ? (
        <div className="card text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all' 
              ? 'Task bulunamadı' 
              : 'Henüz task yok'}
          </h3>
          <p className="mt-2 text-gray-500">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all'
              ? 'Farklı filtreler deneyebilir veya yeni task oluşturabilirsiniz.'
              : 'İlk taskınızı oluşturmaya başlayın.'
            }
          </p>
          {(!searchTerm && statusFilter === 'all' && typeFilter === 'all' && priorityFilter === 'all') && (
            <button
              onClick={openCreateModal}
              className="btn-primary mt-6"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              İlk Taskınızı Oluşturun
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Task</span>
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tip
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Durum</span>
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Öncelik</span>
                      {sortField === 'priority' && (
                        sortDirection === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('end_date')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Bitiş Tarihi</span>
                      {sortField === 'end_date' && (
                        sortDirection === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İlerleme
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Aksiyonlar</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {task.name}
                        </div>
                        {task.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${TaskTypeColors[task.task_type]}`}>
                        {getTypeText(task.task_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${StatusColors[task.status]}`}>
                        {getStatusText(task.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${PriorityColors[task.priority]}`}>
                        {getPriorityText(task.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.end_date ? new Date(task.end_date).toLocaleDateString('tr-TR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${task.completion_percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">
                          {task.completion_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        >
                          <EllipsisVerticalIcon className="h-5 w-5" />
                        </button>

                        {openMenuId === task.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              onClick={() => openEditModal(task)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <PencilIcon className="h-4 w-4 mr-2" />
                              Düzenle
                            </button>
                            <button
                              onClick={() => {
                                setDeletingTask(task);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Sil
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        isLoading={isLoading}
        projectTasks={tasks}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteTask}
        title="Task'ı Sil"
        message={`"${deletingTask?.name}" task'ını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Sil"
        confirmVariant="danger"
        isLoading={isLoading}
      />

      {/* Close menu when clicking outside */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setOpenMenuId(null)}
        />
      )}
    </div>
  );
};

export default TasksPage;