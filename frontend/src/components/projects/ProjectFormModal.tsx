import React, { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  description?: string;
  team_members: string[];
}

interface ProjectCreate {
  name: string;
  description?: string;
  team_members?: string[];
}

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectCreate) => void;
  project?: Project | null;
  isLoading?: boolean;
}

const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  project,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<ProjectCreate>({
    name: '',
    description: '',
    team_members: []
  });

  const [teamMemberInput, setTeamMemberInput] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        team_members: project.team_members || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        team_members: []
      });
    }
    setTeamMemberInput('');
  }, [project, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addTeamMember = () => {
    const email = teamMemberInput.trim();
    const currentMembers = formData.team_members || [];
    
    if (email && !currentMembers.includes(email)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        setFormData(prev => ({
          ...prev,
          team_members: [...(prev.team_members || []), email]
        }));
        setTeamMemberInput('');
      }
    }
  };

  const removeTeamMember = (email: string) => {
    setFormData(prev => ({
      ...prev,
      team_members: (prev.team_members || []).filter(member => member !== email)
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

        <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 shadow-xl sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {project ? 'Projeyi Düzenle' : 'Yeni Proje Oluştur'}
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
                Proje Adı *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Proje adını girin"
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
                placeholder="Proje açıklamasını girin"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Takım Üyeleri
              </label>
              
              <div className="flex space-x-2 mb-3">
                <input
                  type="email"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Email adresi girin"
                  value={teamMemberInput}
                  onChange={(e) => setTeamMemberInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Ekle
                </button>
              </div>

              {formData.team_members && formData.team_members.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {formData.team_members.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                    >
                      <span className="text-sm text-gray-700">{email}</span>
                      <button
                        type="button"
                        onClick={() => removeTeamMember(email)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
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
                {isLoading ? 'İşleniyor...' : (project ? 'Güncelle' : 'Oluştur')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectFormModal;