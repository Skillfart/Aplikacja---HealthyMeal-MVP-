import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react';
import { createClient } from '@supabase/supabase-js';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { AuthProvider } from './contexts/AuthContext';
import { PreferencesProvider } from './contexts/PreferencesContext';
import theme from './theme';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Views
import LandingPage from './views/LandingPage';
import Dashboard from './views/Dashboard';
import RecipeList from './views/Recipes/RecipeList';
import RecipeDetails from './views/Recipes/RecipeDetails';
import RecipeForm from './views/Recipes/RecipeForm';
import RecipeCompare from './views/Recipes/RecipeCompare';
import Profile from './views/Profile';
import NotFound from './views/NotFound';

// Initialize Supabase client
const supabaseClient = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

/**
 * Główny komponent aplikacji
 * @returns {JSX.Element} Aplikacja HealthyMeal
 */
function App() {
  return (
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <ColorModeProvider options={theme.config}>
          <SupabaseProvider client={supabaseClient}>
            <AuthProvider>
              <PreferencesProvider>
                <Router>
                  <Layout>
                    <React.Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<LandingPage />} />
                        
                        {/* Protected routes */}
                        <Route element={<PrivateRoute />}>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/recipes" element={<RecipeList />} />
                          <Route path="/recipes/new" element={<RecipeForm />} />
                          <Route path="/recipes/:id" element={<RecipeDetails />} />
                          <Route path="/recipes/:id/edit" element={<RecipeForm />} />
                          <Route path="/recipes/:id/compare" element={<RecipeCompare />} />
                          <Route path="/profile" element={<Profile />} />
                        </Route>

                        {/* Fallback routes */}
                        <Route path="/404" element={<NotFound />} />
                        <Route path="*" element={<Navigate to="/404" replace />} />
                      </Routes>
                    </React.Suspense>
                  </Layout>
                </Router>
              </PreferencesProvider>
            </AuthProvider>
          </SupabaseProvider>
        </ColorModeProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );
}

export default App; 