import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import Layout from './components/Layout';

// Basit user type
interface User {
  id: string;
  name: string;
  email: string;
}

// Demo projeler
const demoProjects = [
  {
    id: '1',
    name: 'Website Yenileme',
    description: 'Şirket websitesini yeniden tasarlama',
    status: 'Devam Ediyor',
    progress: 65
  },
  {
    id: '2', 
    name: 'Mobil Uygulama',
    description: 'iOS ve Android uygulaması geliştirme',
    status: 'Başlamadı',
    progress: 0
  },
  {
    id: '3',
    name: 'E-ticaret Entegrasyonu',
    description: 'Online satış sistemi kurulumu',
    status: 'Tamamlandı',
    progress: 100
  }
];

function App() {
  const [user, setUser] = useState<User | null>(null);

  // Basit login fonksiyonu
  const handleLogin = (email: string, password: string) => {
    if (email === 'demo@example.com' && password === 'demo123') {
      setUser({
        id: '1',
        name: 'Demo Kullanıcı',
        email: 'demo@example.com'
      });
      return true;
    }
    return false;
  };

  // Logout fonksiyonu
  const handleLogout = () => {
    setUser(null);
  };

  // Login kontrolü
  const isAuthenticated = !!user;

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
                <LoginPage onLogin={handleLogin} />
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
                      element={<DashboardPage projects={demoProjects} />} 
                    />
                    <Route 
                      path="/projects" 
                      element={<ProjectsPage projects={demoProjects} />} 
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