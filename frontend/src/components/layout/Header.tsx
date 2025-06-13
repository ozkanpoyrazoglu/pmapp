import React, { useState } from 'react';
import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useProject } from '../../contexts/ProjectContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { currentProject } = useProject();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left side */}
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={onMenuClick}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Breadcrumb */}
          <div className="ml-4 lg:ml-0">
            <nav className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500">Projeler</span>
              {currentProject && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="font-medium text-gray-900">
                    {currentProject.name}
                  </span>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button
            type="button"
            className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <BellIcon className="h-6 w-6" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <UserCircleIcon className="h-8 w-8" />
              <span className="hidden sm:block text-sm font-medium">
                {user?.full_name}
              </span>
            </button>

            {/* User dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.full_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.email}
                  </p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close user menu when clicking outside */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;