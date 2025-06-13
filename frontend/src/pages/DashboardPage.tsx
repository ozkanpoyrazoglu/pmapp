// frontend/src/pages/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Project, Task } from '../api/api';
import apiClient from '../api/api';

interface DashboardPageProps {
  projects: Project[];
  onProjectsRefresh: () => void;
  error?: string | null;
}

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  averageProgress: number;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ 
  projects, 
  onProjectsRefresh,
  error 
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    averageProgress: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);

  useEffect(() => {
    calculateStats();
    loadRecentTasks();
  }, [projects]);

  const calculateStats = () => {
    if (projects.length === 0) {
      setStats({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        averageProgress: 0,
      });
      return;
    }

    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    
    // Basit ilerleme hesaplaması (gerçekte backend'den gelecek)
    const averageProgress = Math.round(
      projects.reduce((sum, p) => {
        switch (p.status) {
          case 'completed': return sum + 100;
          case 'in_progress': return sum + 50;
          case 'on_hold': return sum + 25;
          default: return sum + 0;
        }
      }, 0) / projects.length
    );

    setStats({
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      totalTasks: 0, // Will be updated from tasks
      completedTasks: 0, // Will be updated from tasks
      inProgressTasks: 0, // Will be updated from tasks
      averageProgress,
    });
  };

  const loadRecentTasks = async () => {
    if (projects.length === 0) {
      setLoading(false);
      return;
    }

    setTasksLoading(true);
    const allTasks: Task[] = [];
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;

    try {
      // Son 3 aktif projeden task'ları al
      const activeProjects = projects
        .filter(p => p.status === 'in_progress')
        .slice(0, 3);

      for (const project of activeProjects) {
        try {
          const tasks = await apiClient.getProjectTasks(project.id);
          allTasks.push(...tasks.map(task => ({ ...task, projectName: project.name })));
          
          totalTasks += tasks.length;
          completedTasks += tasks.filter(t => t.status === 'completed').length;
          inProgressTasks += tasks.filter(t => t.status === 'in_progress').length;
        } catch (err) {
          console.error(`Error loading tasks for project ${project.id}:`, err);
        }
      }

      // En son oluşturulan task'ları al
      const sortedTasks = allTasks
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      setRecentTasks(sortedTasks);
      
      // Task istatistiklerini güncelle
      setStats(prev => ({
        ...prev,
        totalTasks,
        completedTasks,
        inProgressTasks,
      }));

    } catch (err) {
      console.error('Error loading recent tasks:', err);
    } finally {
      setTasksLoading(false);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'in_progress':
        return 'Devam Ediyor';
      case 'on_hold':
        return 'Beklemede';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Başlamadı';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'Kritik';
      case 'high':
        return 'Yüksek';
      case 'medium':
        return 'Orta';
      default:
        return 'Düşük';
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Dashboard yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Proje durumunuza genel bir bakış
          </p>
        </div>
        <button
          onClick={onProjectsRefresh}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Yenile
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Veri yüklenirken hata oluştu</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* İstatistik kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Toplam Proje */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Toplam Proje
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalProjects}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Aktif Proje */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Aktif Proje
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.activeProjects}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Toplam Görev */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Toplam Görev
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalTasks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Ortalama İlerleme */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ort. İlerleme
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    %{stats.averageProgress}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* İçerik Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Son projeler */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Son Projeler
              </h3>
              <Link
                to="/projects"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Tümünü görüntüle →
              </Link>
            </div>

            <div className="space-y-3">
              {projects.length === 0 ? (
                <div className="text-center py-6">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">Henüz proje bulunmuyor</p>
                </div>
              ) : (
                projects.slice(0, 3).map((project) => {
                  const progress = project.status === 'completed' ? 100 : 
                    project.status === 'in_progress' ? 50 : 0;

                  return (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Link
                          to={`/projects/${project.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {project.name}
                        </Link>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                      </div>
                      {project.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="ml-2 text-xs text-gray-600">
                          %{progress}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Son görevler */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Son Görevler
              </h3>
              {tasksLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
            </div>

            <div className="space-y-3">
              {recentTasks.length === 0 ? (
                <div className="text-center py-6">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">Henüz görev bulunmuyor</p>
                </div>
              ) : (
                recentTasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {task.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(task as any).projectName && `${(task as any).projectName} • `}
                          {new Date(task.created_at).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {getStatusText(task.status)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {getPriorityText(task.priority)}
                        </span>
                      </div>
                    </div>
                    {task.assigned_to && (
                      <p className="text-xs text-gray-500 mb-1">
                        Atanan: {task.assigned_to}
                      </p>
                    )}
                    {task.completion_percentage > 0 && (
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-green-600 h-1.5 rounded-full"
                            style={{ width: `${task.completion_percentage}%` }}
                          />
                        </div>
                        <span className="ml-2 text-xs text-gray-600">
                          %{task.completion_percentage}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Özet kart */}
      {projects.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-blue-200">
                    Güncel Durum
                  </dt>
                  <dd className="text-lg font-medium text-white">
                    {stats.totalProjects} proje ile toplam {stats.totalTasks} görev yönetiliyor.
                    {stats.activeProjects > 0 && ` ${stats.activeProjects} aktif proje devam ediyor.`}
                    {stats.completedProjects > 0 && ` ${stats.completedProjects} proje tamamlandı.`}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;