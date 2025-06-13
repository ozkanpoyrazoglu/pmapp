import React, { useState, useEffect } from 'react';

interface Task {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  completion_percentage: number;
  tags: string[];
  dependencies: string[];
}

interface TaskCreate {
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  completion_percentage?: number;
  tags?: string[];
  dependencies?: string[];
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskCreate) => void;
  task?: Task | null;
  isLoading?: boolean;
  projectTasks: Task[];
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  task,
  isLoading = false,
  projectTasks
}) => {
  const [formData, setFormData] = useState<TaskCreate>({
    name: '',
    description: '',
    status: 'not_started',
    priority: 'medium',
    completion_percentage: 0,
    tags: [],
    dependencies: []
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        completion_percentage: task.completion_percentage,
        tags: task.tags || [],
        dependencies: task.dependencies || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'not_started',
        priority: 'medium',
        completion_percentage: 0,
        tags: [],
        dependencies: []
      });
    }
    setTagInput('');
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;

    if (type === 'number') {
      processedValue = value === '' ? 0 : Number(value);
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    const currentTags = formData.tags || [];
    
    if (tag && !currentTags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 shadow-xl sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {task ? 'Task\'ı Düzenle' : 'Yeni Task Oluştur'}
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Task Adı *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Task adını girin"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Task açıklamasını girin"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Durum
                </label>
                <select
                  id="status"
                  name="status"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="not_started">Başlamadı</option>
                  <option value="in_progress">Devam Ediyor</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="on_hold">Beklemede</option>
                  <option value="cancelled">İptal Edildi</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Öncelik
                </label>
                <select
                  id="priority"
                  name="priority"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                  <option value="critical">Kritik</option>
                </select>
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.completion_percentage}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiketler
              </label>
              
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Etiket ekle"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Ekle
                </button>
              </div>

              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-500 hover:text-blue-700"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'İşleniyor...' : (task ? 'Güncelle' : 'Oluştur')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskFormModal;