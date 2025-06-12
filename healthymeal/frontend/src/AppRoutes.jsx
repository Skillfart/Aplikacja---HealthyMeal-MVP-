import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Importy stron
import Dashboard from './pages/Dashboard';
import UserPreferences from './pages/UserPreferences';
import RecipeDetails from './pages/RecipeDetails';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import RecipesPage from './pages/RecipesPage';

// Komponent chroniony - wymaga autoryzacji
const ProtectedRoute = ({ children }) => {
  const { session } = useAuth();
  
  if (!session?.access_token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Chronione ścieżki */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/profile/preferences" element={
        <ProtectedRoute>
          <UserPreferences />
        </ProtectedRoute>
      } />
      
      <Route path="/recipes" element={
        <ProtectedRoute>
          <RecipesPage />
        </ProtectedRoute>
      } />
      
      <Route path="/recipes/:id" element={
        <ProtectedRoute>
          <RecipeDetails />
        </ProtectedRoute>
      } />
      
      <Route path="/recipes/new" element={
        <ProtectedRoute>
          <RecipesPage />
        </ProtectedRoute>
      } />
      
      {/* Przekierowanie dla nieznanych ścieżek */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 