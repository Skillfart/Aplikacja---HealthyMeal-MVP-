import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';

const SupabaseContext = createContext();

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}

export function SupabaseProvider({ children, client }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    // Pobierz aktualną sesję
    setSession(client.auth.getSession());

    // Nasłuchuj zmian sesji
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [client.auth]);

  // Funkcje autoryzacji
  const signUp = async (email, password) => {
    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Konto utworzone',
        description: 'Sprawdź swoją skrzynkę email, aby potwierdzić rejestrację.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      return data;
    } catch (error) {
      toast({
        title: 'Błąd rejestracji',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: 'Zalogowano pomyślnie',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      return data;
    } catch (error) {
      toast({
        title: 'Błąd logowania',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;

      toast({
        title: 'Wylogowano pomyślnie',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Błąd wylogowania',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await client.auth.resetPasswordForEmail(email);
      if (error) throw error;

      toast({
        title: 'Link do resetowania hasła wysłany',
        description: 'Sprawdź swoją skrzynkę email.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Błąd resetowania hasła',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await client.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      toast({
        title: 'Hasło zmienione pomyślnie',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Błąd zmiany hasła',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    }
  };

  const value = {
    session,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    loading,
    supabase: client,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
} 