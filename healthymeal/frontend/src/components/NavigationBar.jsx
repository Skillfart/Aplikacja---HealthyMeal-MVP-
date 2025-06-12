import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AIUsageCounter from './AIUsageCounter';

const NavigationBar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Błąd podczas wylogowywania:', error);
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                HealthyMeal
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/dashboard')
                    ? 'border-b-2 border-primary-500 text-gray-900'
                    : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/recipes"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/recipes')
                    ? 'border-b-2 border-primary-500 text-gray-900'
                    : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Przepisy
              </Link>
              <Link
                to="/profile/preferences"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActive('/profile/preferences')
                    ? 'border-b-2 border-primary-500 text-gray-900'
                    : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Preferencje
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <AIUsageCounter />
            <button
              onClick={handleSignOut}
              className="btn btn-secondary"
            >
              Wyloguj się
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobilne */}
      <div className="sm:hidden">
        <div className="space-y-1 pb-3 pt-2">
          <Link
            to="/dashboard"
            className={`block px-3 py-2 text-base font-medium ${
              isActive('/dashboard')
                ? 'bg-primary-50 border-l-4 border-primary-500 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/recipes"
            className={`block px-3 py-2 text-base font-medium ${
              isActive('/recipes')
                ? 'bg-primary-50 border-l-4 border-primary-500 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300'
            }`}
          >
            Przepisy
          </Link>
          <Link
            to="/profile/preferences"
            className={`block px-3 py-2 text-base font-medium ${
              isActive('/profile/preferences')
                ? 'bg-primary-50 border-l-4 border-primary-500 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300'
            }`}
          >
            Preferencje
          </Link>
        </div>
        <div className="border-t border-gray-200 pb-3 pt-4">
          <div className="px-4">
            <AIUsageCounter />
          </div>
          <div className="mt-3 space-y-1">
            <button
              onClick={handleSignOut}
              className="block w-full px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            >
              Wyloguj się
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar; 