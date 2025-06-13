import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  HomeIcon,
  FolderIcon,
  ListBulletIcon,
  CalendarDaysIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useProject } from '../../contexts/ProjectContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { projects, currentProject, setCurrentProject } = useProject();
  const { projectId } = useParams();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Projeler', href: '/projects', icon: FolderIcon },
  ];

  const projectNavigation = currentProject ? [
    { 
      name: 'Tasklar', 
      href: `/projects/${currentProject.id}/tasks`, 
      icon: ListBulletIcon 
    },
    { 
      name: 'Timeline', 
      href: `/projects/${currentProject.id}/timeline`, 
      icon: CalendarDaysIcon 
    },
  ] : [];

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
        <SidebarContent 
          navigation={navigation}
          projectNavigation={projectNavigation}
          projects={projects}
          currentProject={currentProject}
          setCurrentProject={setCurrentProject}
          projectId={projectId}
        />
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            type="button"
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={onClose}
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
        </div>
        
        <SidebarContent 
          navigation={navigation}
          projectNavigation={projectNavigation}
          projects={projects}
          currentProject={currentProject}
          setCurrentProject={setCurrentProject}
          projectId={projectId}
          onClose={onClose}
        />
      </div>
    </>
  );
};

interface SidebarContentProps {
  navigation: Array<{ name: string; href: string; icon: React.ComponentType<any> }>;
  projectNavigation: Array<{ name: string; href: string; icon: React.ComponentType<any> }>;
  projects: any[];
  currentProject: any;
  setCurrentProject: (project: any) => void;
  projectId?: string;
  onClose?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  navigation,
  projectNavigation,
  projects,
  currentProject,
  setCurrentProject,
  projectId,
  onClose
}) => {
  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">
          Project Manager
        </h1>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Main navigation */}
        <nav className="px-3 mt-6">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    isActive
                      ? 'sidebar-link-active'
                      : 'sidebar-link-inactive'
                  }
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Project list */}
        <div className="px-3 mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Projeler
            </h3>
            <NavLink
              to="/projects"
              onClick={handleLinkClick}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Yeni Proje"
            >
              <PlusIcon className="h-4 w-4" />
            </NavLink>
          </div>
          
          <ul className="space-y-1 max-h-48 overflow-y-auto">
            {projects.map((project) => (
              <li key={project.id}>
                <button
                  onClick={() => {
                    setCurrentProject(project);
                    handleLinkClick();
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                    project.id === projectId
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="truncate">{project.name}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Project-specific navigation */}
        {currentProject && projectNavigation.length > 0 && (
          <nav className="px-3 mt-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {currentProject.name}
            </h3>
            <ul className="space-y-1">
              {projectNavigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      isActive
                        ? 'sidebar-link-active'
                        : 'sidebar-link-inactive'
                    }
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Sidebar;