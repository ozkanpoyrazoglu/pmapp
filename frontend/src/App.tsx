// frontend/src/App.tsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import Layout from './components/Layout';
import { apiClient, User, Project } from './api/api';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Uygulama başlatıldığında kullanıcı kontrolü
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Kullanıcı giriş yaptığında projeleri yükle
  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      apiClient.setToken(token);
      try {
        const userData = await apiClient.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Auth check failed:', err);
        apiClient.clearToken();
      }
    }
    setLoading(false);
  };

  const loadProjects = async () => {
    try {
      setError(null);
      const projectsData = await apiClient.getProjects();
      setProjects(projectsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Projeler yüklenirken hata oluştu');
      console.error('Error loading projects:', err);
    }
  };

  // Login fonksiyonu
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const loginData = await apiClient.login(email, password);
      apiClient.setToken(loginData.access_token);
      
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş başarısız');
      console.error('Login error:', err);
      return false;
    }
  };

  // Logout fonksiyonu
  const handleLogout = () => {
    apiClient.clearToken();
    setUser(null);
    setProjects([]);
  };

  // Proje oluşturma
  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
  };

  // Proje güncelleme
  const handleProjectUpdated = (updatedProject: Project) => {
    setProjects(prev => prev.map(project => 
      project.id === updatedProject.id ? updatedProject : project
    ));
  };

  // Proje silme
  const handleProjectDeleted = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
  };

  // Login kontrolü
  const isAuthenticated = !!user;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Login route */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <LoginPage onLogin={handleLogin} error={error} />
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/*" 
            element={
              isAuthenticated ? (
                <Layout user={user} onLogout={handleLogout}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    
                    <Route 
                      path="/dashboard" 
                      element={
                        <DashboardPage 
                          projects={projects} 
                          onProjectsRefresh={loadProjects}
                          error={error}
                        />
                      } 
                    />
                    
                    <Route 
                      path="/projects" 
                      element={
                        <ProjectsPage 
                          projects={projects} 
                          onProjectCreated={handleProjectCreated}
                          onProjectUpdated={handleProjectUpdated}
                          onProjectDeleted={handleProjectDeleted}
                          onProjectsRefresh={loadProjects}
                          error={error}
                        />
                      } 
                    />
                    
                    <Route 
                      path="/projects/:projectId" 
                      element={<ProjectDetailPage />} 
                    />
                    
                    {/* 404 route */}
                    <Route 
                      path="*" 
                      element={
                        <div className="text-center py-12">
                          <h1 className="text-2xl font-bold text-gray-900">404 - Sayfa Bulunamadı</h1>
                          <p className="mt-2 text-gray-600">Aradığınız sayfa mevcut değil.</p>
                        </div>
                      } 
                    />
                  </Routes>
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;