import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LandingPage } from './views/LandingPage/LandingPage';
import { Dashboard } from './views/Dashboard/Dashboard';
import RecipesList from './views/Recipes/RecipesList';
import { RecipeDetails } from './views/Recipes/RecipeDetails';
import { RecipeForm } from './views/Recipes/RecipeForm';
import { RecipeModify } from './views/Recipes/RecipeModify';
import { RecipeCompare } from './views/Recipes/RecipeCompare';
import { Profile } from './views/Profile/Profile';
import { Preferences } from './views/Profile/Preferences';
import { Feedback } from './views/Feedback/Feedback';
import { NotFound } from './views/common/NotFound';
import SingleRecipe from './views/Recipes/SingleRecipe';
import { supabase } from './lib/supabase.js';

// Importujemy komponenty Auth z pliku indeksowego JavaScript
import { LoginPage, RegisterPage, PasswordResetPage } from './components/Auth';

// Prywatna ścieżka, która sprawdza czy użytkownik jest zalogowany
const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Pobierz sesję z Supabase
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
        setLoading(false);
      } catch (err) {
        console.error("Błąd autoryzacji:", err);
        setError("Problem z autoryzacją. Odśwież stronę lub zaloguj się ponownie.");
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Nasłuchuj na zmiany stanu autentykacji
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
  
  if (loading) return <div>Ładowanie...</div>;
  
  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Wystąpił problem</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{ 
            padding: '10px 15px', 
            background: '#4CAF50', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Powrót do strony głównej
        </button>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <>
      <ToastContainer />
    <Routes>
      <Route path="/" element={<LandingPage />} />
        
        {/* Strony autentykacji */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />
      
      {/* Dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      
      {/* Przepisy */}
      <Route 
        path="/recipes" 
        element={
          <PrivateRoute>
            <RecipesList />
          </PrivateRoute>
        }
      />
      <Route 
        path="/recipes/new" 
        element={
          <PrivateRoute>
            <RecipeForm />
          </PrivateRoute>
        }
      />
      <Route 
        path="/recipes/:id" 
        element={
          <PrivateRoute>
            <RecipeDetails />
          </PrivateRoute>
        }
      />
      <Route 
        path="/recipes/:id/edit" 
        element={
          <PrivateRoute>
            <RecipeForm />
          </PrivateRoute>
        }
      />
      <Route 
        path="/recipes/:id/modify" 
        element={
          <PrivateRoute>
            <RecipeModify />
          </PrivateRoute>
        }
      />
      <Route 
        path="/recipes/compare" 
        element={
          <PrivateRoute>
            <RecipeCompare />
          </PrivateRoute>
        }
      />
      <Route 
        path="/recipes/modified" 
        element={
          <PrivateRoute>
            <RecipesList isModified={true} />
          </PrivateRoute>
        }
      />
      
      {/* Dashboard routes */}
      <Route 
        path="/dashboard/recipes" 
        element={
          <PrivateRoute>
            <RecipesList />
          </PrivateRoute>
        }
      />
      <Route 
        path="/dashboard/recipes/new" 
        element={
          <PrivateRoute>
            <RecipeForm />
          </PrivateRoute>
        }
      />
      <Route 
        path="/dashboard/recipes/edit/:id" 
        element={
          <PrivateRoute>
            <RecipeForm />
          </PrivateRoute>
        }
      />
      <Route 
        path="/dashboard/recipes/:id" 
        element={
          <PrivateRoute>
            <SingleRecipe />
          </PrivateRoute>
        }
      />
      <Route 
        path="/dashboard/recipes/compare" 
        element={
          <PrivateRoute>
            <RecipeCompare />
          </PrivateRoute>
        }
      />
      
      {/* Profil użytkownika */}
      <Route 
        path="/profile" 
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route 
        path="/profile/preferences" 
        element={
          <PrivateRoute>
            <Preferences />
          </PrivateRoute>
        }
      />
      
      {/* Zgłoszenia */}
      <Route 
        path="/feedback" 
        element={
          <PrivateRoute>
            <Feedback />
          </PrivateRoute>
        }
      />
      
      {/* Przekierowanie dla nieistniejących ścieżek */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" />} />
    </Routes>
    </>
  );
}

export default App; 