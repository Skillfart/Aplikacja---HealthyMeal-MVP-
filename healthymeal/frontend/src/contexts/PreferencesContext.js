import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPreferences, updatePreferences } from '../services/preferencesService';
import { useAuth } from './AuthContext';

const PreferencesContext = createContext();

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences musi być używany wewnątrz PreferencesProvider');
  }
  return context;
};

export const PreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadPreferences();
    }
  }, [isAuthenticated]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await getPreferences();
      setPreferences(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserPreferences = async (newPreferences) => {
    try {
      setLoading(true);
      const updatedPreferences = await updatePreferences(newPreferences);
      setPreferences(updatedPreferences);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        loading,
        error,
        updatePreferences: updateUserPreferences,
        reloadPreferences: loadPreferences
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}; 