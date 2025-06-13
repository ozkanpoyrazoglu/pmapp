import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
}

interface CreateProjectPageProps {
  onCreateProject: (project: Omit<Project, 'id'>) => void;
}

const CreateProjectPage: React.FC<CreateProjectPageProps> = ({ onCreateProject }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Başlamadı',
    progress: 0
  });

  const statusOptions = [
    'Başlamadı',
    'Devam Ediyor', 
    'Tamamlandı',
    'Beklemede',
    'İptal Edildi'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'progress' ? parseInt(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Proje adı zorunludur';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Proje adı en az 3 karakter olmalıdır';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Proje açıklaması zorunludur';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Açıklama en az 10 karakter olmalıdır';
    }

    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'İlerleme 0-100 arasında olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onCreateProject({
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        progress: formData.progress
      });

      // Show success message
      alert('Proje başarıyla oluşturuldu!');
      
      // Navigate back to projects
      navigate('/projects');
    } catch (error) {
      alert('Proje oluşturulurken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.name || formData.description) {
      if (window.confirm('Değişiklikler kaydedilmeyecek. Devam etmek istiyor musunuz?')) {
        navigate('/projects');
      }
    } else {
      navigate('/projects');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yeni Proje Oluştur</h1>
            <p className="mt-1 text-sm text-gray-600">
              Yeni bir proje oluşturun ve takım çalışmasını başlatın
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Proje Adı */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Proje Adı *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Proje adını girin"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Proje Açıklaması */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Proje Açıklaması *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Proje hakkında detaylı açıklama yazın"
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Grid for Status and Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Proje Durumu */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Proje Durumu
              </label>
              <select
                id="status"
                name="status"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.status}
                onChange={handleChange}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* İlerleme */}
            <div>
              <label htmlFor="progress" className="block text-sm font-medium text-gray-700 mb-1">
                İlerleme (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="progress"
                  name="progress"
                  min="0"
                  max="100"
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.progress ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="0"
                  value={formData.progress}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">%</span>
                </div>
              </div>
              {errors.progress && (
                <p className="mt-1 text-sm text-red-600">{errors.progress}</p>
              )}
              
              {/* Progress Preview */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>İlerleme Önizlemesi</span>
                  <span>{formData.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      formData.progress === 100
                        ? 'bg-green-600'
                        : formData.progress >= 50
                        ? 'bg-blue-600'
                        : 'bg-yellow-600'
                    }`}
                    style={{ width: `${Math.min(Math.max(formData.progress, 0), 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Oluşturuluyor...
                </div>
              ) : (
                'Proje Oluştur'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Text */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              İpuçları
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Proje adı benzersiz ve açıklayıcı olmalıdır</li>
                <li>Açıklama projenin amacını ve kapsamını belirtmelidir</li>
                <li>İlerleme durumu projeyi oluşturduktan sonra güncellenebilir</li>
                <li>Proje oluşturduktan sonra task'lar ve takım üyeleri ekleyebilirsiniz</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;