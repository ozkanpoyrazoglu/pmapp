import React, { useState } from 'react';
import { useProject, TaskStatus } from '../contexts/ProjectContext';

const ProjectsPage: React.FC = () => {
  const { projects } = useProject();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.IN_PROGRESS:
        return 'Devam Ediyor';
      case TaskStatus.NOT_STARTED:
        return 'Başlamadı';
      case TaskStatus.COMPLETED:
        return 'Tamamlandı';
      case TaskStatus.ON_HOLD:
        return 'Beklemede';
      case TaskStatus.CANCELLED:
        return 'İptal Edildi';
      default:
        return 'Bilinmiyor';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case TaskStatus.NOT_STARTED:
        return 'bg-gray-100 text-gray-800';
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TaskStatus.ON_HOLD:
        return 'bg-yellow-100 text-yellow-800';
      case TaskStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projeler</h1>
          <p className="mt-1 text-sm text-gray-600">
            Projelerinizi yönetin ve takip edin
          </p>
        </div>
        <button
          onClick={() => alert('Yeni proje oluşturma özelliği yakında eklenecek!')}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Yeni Proje
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          placeholder="Proje ara..."
          className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {searchTerm ? 'Proje bulunamadı' : 'Demo projeler yüklendi'}
          </h3>
          <p className="mt-2 text-gray-500">
            {searchTerm 
              ? 'Farklı arama terimleri deneyebilirsiniz.'
              : 'Demo projeler otomatik olarak yüklendi.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {project.name}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {getStatusText(project.status)}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">
                {project.description || 'Açıklama yok'}
              </p>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Demo Proje
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => alert('Proje detayları yakında eklenecek!')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Görüntüle
                  </button>
                  <button 
                    onClick={() => alert('Proje düzenleme yakında eklenecek!')}
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    Düzenle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Demo Sürüm Bilgisi
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Bu demo sürümde bazı özellikler henüz aktif değil. Yakında eklenecek özellikler:
                • Gerçek proje oluşturma • Task yönetimi • Timeline görünümü • Takım işbirliği
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;