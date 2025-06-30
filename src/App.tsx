import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthPage } from './pages/AuthPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { LoadingSpinner } from './components/common/LoadingSpinner';


const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading SkillForge...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          <Route 
            path="/auth" 
            element={currentUser ? <Navigate to="/dashboard" replace /> : <AuthPage />} 
          />
          <Route 
            path="/dashboard/*" 
            element={currentUser ? <DashboardLayout /> : <Navigate to="/auth" replace />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={currentUser ? "/dashboard" : "/auth"} replace />} 
          />
        </Routes>
      </Router>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <AppContent />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;