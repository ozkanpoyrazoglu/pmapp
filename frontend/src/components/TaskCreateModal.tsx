// frontend/src/components/TaskCreateModal.tsx

import React, { useState } from 'react';
import { apiClient, Task, TaskCreate } from '../api/api';

interface TaskCreateModalProps {
  projectId: string;
  onTaskCreated: (task: Task) => void;
  onClose: () => void;
}

const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  projectId,
  onTaskCreated,
  onClose,
}) => {
  const [formData, setFormData] = useState<TaskCreate>({
    name: '',
    description: '',
    task_type: 'task',
    status: 'not_started',
    priority: 'medium',
    start_date: '',
    end_date: '',
    duration_days: undefined,
    effort_hours: undefined,
    completion_percentage: 0,
    assigned_to: '',
    dependencies: [],
    parent_epic: '',
    tags: [],
    custom_fields: {},
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || [],
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Görev adı gereklidir';
    }

    if (formData.name.length < 2) {
      return 'Görev adı en az 2 karakter olmalıdır';
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (startDate > endDate) {
        return 'Başlangıç tarihi bitiş tarihinden önce olmalıdır';
      }
    }

    if (formData.completion_percentage !== undefined && 
        (formData.completion_percentage < 0 || formData.completion_percentage > 100)) {
      return 'Tamamlanma yüzdesi 0-100 arasında olmalıdır';
    }

    if (formData.duration_days !== undefined && formData.duration_days < 0) {
      return 'Süre negatif olamaz';
    }

    if (formData.effort_hours !== undefined && formData.effort_hours < 0) {
      return 'Efor saati negatif olamaz';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Boş değerleri temizle
      const cleanedData: TaskCreate = {};
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          if (key === 'tags' && Array.isArray(value) && value.length === 0) {
            return;
          }
          (cleanedData as any)[key] = value;
        }
      });

      const newTask = await apiClient.createTask(projectId, cleanedData);
      onTaskCreated(newTask);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Görev oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const taskTypeOptions = [
    { value: 'task', label: 'Görev' },
    { value: 'epic', label: 'Epic' },
    { value: 'milestone', label: 'Kilometre Taşı' },
  ];

  const statusOptions = [
    { value: 'not_started', label: 'Başlamadı' },
    { value: 'in_progress', label: 'Devam Ediyor' },
    { value: 'completed', label: 'Tamamlandı' },
    { value: 'on_hold', label: 'Beklemede' },
    { value: 'cancelled', label: 'İptal Edildi' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Düşük' },
    { value: 'medium', label: 'Orta' },
    { value: 'high', label: 'Yüksek' },
    { value: 'critical', label: 'Kritik' },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Yeni Görev Oluştur</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Görev Adı */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Görev Adı *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                maxLength={200}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Görev adını girin"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            {/* Açıklama */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                maxLength={1000}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Görev açıklaması (isteğe bağlı)"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            {/* Görev Tipi, Status, Priority */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="task_type" className="block text-sm font-medium text-gray-700">
                  Görev Tipi
                </label>
                <select
                  id="task_type"
                  name="task_type"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.task_type}
                  onChange={handleInputChange}
                >
                  {taskTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Durum
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Öncelik
                </label>
                <select
                  id="priority"
                  name="priority"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tarihler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.start_date}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.end_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Süre ve Efor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="duration_days" className="block text-sm font-medium text-gray-700">
                  Süre (Gün)
                </label>
                <input
                  type="number"
                  id="duration_days"
                  name="duration_days"
                  min="0"
                  step="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  value={formData.duration_days || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="effort_hours" className="block text-sm font-medium text-gray-700">
                  Efor (Saat)
                </label>
                <input
                  type="number"
                  id="effort_hours"
                  name="effort_hours"
                  min="0"
                  step="0.5"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  value={formData.effort_hours || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="completion_percentage" className="block text-sm font-medium text-gray-700">
                  Tamamlanma (%)
                </label>
                <input
                  type="number"
                  id="completion_percentage"
                  name="completion_percentage"
                  min="0"
                  max="100"
                  step="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.completion_percentage}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Atanan Kişi */}
            <div>
              <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">
                Atanan Kişi (Email)
              </label>
              <input
                type="email"
                id="assigned_to"
                name="assigned_to"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="user@example.com"
                value={formData.assigned_to}
                onChange={handleInputChange}
              />
            </div>

            {/* Etiketler */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiketler
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-800"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Etiket ekle"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100"
                >
                  Ekle
                </button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={loading}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Oluşturuluyor...' : 'Görev Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskCreateModal;