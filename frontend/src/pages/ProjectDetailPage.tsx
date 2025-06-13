import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import { TaskStatus, TaskType, StatusColors, TaskTypeColors } from '../types';
import {
  PencilIcon,
  ListBulletIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ProjectFormModal from '../components/projects/ProjectFormModal';

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    projects,
    currentProject,
    tasks,
    setCurrentProject,
    loadTasks,
    updateProject,
    isLoading
  } = useProject();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const handleUpdateProject = async (projectData: any) => {
    if (!currentProject) return;
    
    try {
      await updateProject(currentProject.id, projectData);
      setIsEditModalOpen(false);
    } catch (error) {
      // Error handling is done in context
    }
  };

  // İstatistikleri hesapla
  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
    inProgressTasks: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    epics: tasks.filter(t => t.task_type === TaskType.EPIC).length,
    milestones: tasks.filter(t => t.task_type === TaskType.MILESTONE).length,
    overdueTasks: tasks.filter(t => {
      if (!t.end_date) return false;
      return new Date(t.end_date) < new Date() && t.status !== TaskStatus.COMPLETED;
    }).length
  };

  const completionPercentage = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

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

  if (isLoading || !currentProject) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {currentProject.name}
            </h1>
            <span className={`badge ${StatusColors[currentProject.status]}`}>
              {getStatusText(currentProject.status)}
            </span>
          </div>
          {currentProject.description && (
            <p className="text-gray-600 max-w-3xl">
              {currentProject.description}
            </p>
          )}
        </div>
        
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="btn-secondary mt-4 sm:mt-0"
        >
          <PencilIcon className="h-4 w-4 mr-2" />
          Düzenle
        </button>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-500 rounded-lg">
              <ListBulletIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Task</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-green-500 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tamamlanma</p>
              <p className="text-2xl font-bold text-gray-900">%{completionPercentage}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-yellow-500 rounded-lg">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Devam Eden</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgressTasks}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-red-500 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Geciken</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdueTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Project Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Erişim</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to={`/projects/${currentProject.id}/tasks`}
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ListBulletIcon className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Taskları Yönet</h4>
                  <p className="text-sm text-gray-500">{stats.totalTasks} task</p>
                </div>
              </Link>

              <Link
                to={`/projects/${currentProject.id}/timeline`}
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <CalendarDaysIcon className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Timeline Görünümü</h4>
                  <p className="text-sm text-gray-500">Gantt şeması</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">İlerleme Durumu</h3>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Genel İlerleme
                </span>
                <span className="text-sm text-gray-500">
                  {stats.completedTasks} / {stats.totalTasks} task
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Task Type Distribution */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.epics}</div>
                <div className="text-sm text-gray-500">Epic</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalTasks - stats.epics - stats.milestones}
                </div>
                <div className="text-sm text-gray-500">Task</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.milestones}</div>
                <div className="text-sm text-gray-500">Milestone</div>
              </div>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Son Tasklar</h3>
              <Link
                to={`/projects/${currentProject.id}/tasks`}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Tümünü gör
              </Link>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <ListBulletIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h4 className="mt-2 text-sm font-medium text-gray-900">
                  Henüz task yok
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  İlk taskınızı oluşturmaya başlayın
                </p>
                <Link
                  to={`/projects/${currentProject.id}/tasks`}
                  className="btn-primary mt-4"
                >
                  Task Oluştur
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`badge ${TaskTypeColors[task.task_type]}`}>
                          {task.task_type.toUpperCase()}
                        </span>
                        <h4 className="text-sm font-medium text-gray-900">
                          {task.name}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500">
                        {task.description || 'Açıklama yok'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`badge ${StatusColors[task.status]}`}>
                        {getStatusText(task.status)}
                      </span>
                      {task.completion_percentage > 0 && (
                        <span className="text-xs text-gray-500">
                          %{task.completion_percentage}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Project Sidebar */}
        <div className="space-y-6">
          {/* Project Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Proje Detayları</h3>
            
            <div className="space-y-4">
              {currentProject.start_date && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">Başlangıç Tarihi</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(currentProject.start_date).toLocaleDateString('tr-TR')}
                  </dd>
                </div>
              )}

              {currentProject.end_date && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">Bitiş Tarihi</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(currentProject.end_date).toLocaleDateString('tr-TR')}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-sm font-medium text-gray-600">Oluşturulma Tarihi</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(currentProject.created_at).toLocaleDateString('tr-TR')}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-600">Son Güncelleme</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(currentProject.updated_at).toLocaleDateString('tr-TR')}
                </dd>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <UserGroupIcon className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Takım Üyeleri</h3>
            </div>

            {currentProject.team_members.length === 0 ? (
              <p className="text-sm text-gray-500">Henüz takım üyesi eklenmemiş</p>
            ) : (
              <div className="space-y-2">
                {currentProject.team_members.map((member) => (
                  <div
                    key={member}
                    className="flex items-center p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-primary-700">
                        {member.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-900">{member}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Project Modal */}
      <ProjectFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateProject}
        project={currentProject}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProjectDetailPage;