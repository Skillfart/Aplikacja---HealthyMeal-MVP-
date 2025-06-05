import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useSupabase } from './SupabaseContext';

const PreferencesContext = createContext();

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}

export function PreferencesProvider({ children }) {
  const { supabase, session } = useSupabase();
  const [preferences, setPreferences] = useState({
    dietType: 'normal',
    maxCarbs: 100,
    excludedProducts: [],
    allergens: []
  });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Pobierz preferencje użytkownika po zalogowaniu
  useEffect(() => {
    if (session?.user) {
      fetchPreferences();
    }
  }, [session]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      toast({
        title: 'Błąd pobierania preferencji',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: session.user.id,
          ...newPreferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setPreferences(newPreferences);
      toast({
        title: 'Preferencje zaktualizowane',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Błąd aktualizacji preferencji',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  };

  const addExcludedProduct = async (product) => {
    try {
      const updatedProducts = [...preferences.excludedProducts, product];
      await updatePreferences({
        ...preferences,
        excludedProducts: updatedProducts
      });
    } catch (error) {
      toast({
        title: 'Błąd dodawania produktu',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const removeExcludedProduct = async (product) => {
    try {
      const updatedProducts = preferences.excludedProducts.filter(p => p !== product);
      await updatePreferences({
        ...preferences,
        excludedProducts: updatedProducts
      });
    } catch (error) {
      toast({
        title: 'Błąd usuwania produktu',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const toggleAllergen = async (allergen) => {
    try {
      const updatedAllergens = preferences.allergens.includes(allergen)
        ? preferences.allergens.filter(a => a !== allergen)
        : [...preferences.allergens, allergen];
      
      await updatePreferences({
        ...preferences,
        allergens: updatedAllergens
      });
    } catch (error) {
      toast({
        title: 'Błąd aktualizacji alergenów',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const updateDietType = async (dietType) => {
    try {
      await updatePreferences({
        ...preferences,
        dietType
      });
    } catch (error) {
      toast({
        title: 'Błąd aktualizacji typu diety',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const updateMaxCarbs = async (maxCarbs) => {
    try {
      await updatePreferences({
        ...preferences,
        maxCarbs: parseInt(maxCarbs, 10)
      });
    } catch (error) {
      toast({
        title: 'Błąd aktualizacji limitu węglowodanów',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const value = {
    preferences,
    loading,
    updatePreferences,
    addExcludedProduct,
    removeExcludedProduct,
    toggleAllergen,
    updateDietType,
    updateMaxCarbs
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
} 