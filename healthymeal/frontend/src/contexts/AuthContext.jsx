import React, { createContext, useContext, useState, useEffect } from 'react';
import supabaseClient from '../config/supabaseClient';

/**
 * @typedef {Object} AuthContextType
 * @property {Object|null} session - Sesja użytkownika z Supabase
 * @property {Object|null} user - Dane użytkownika
 * @property {boolean} loading - Stan ładowania
 * @property {Function} signUp - Funkcja rejestracji
 * @property {Function} signIn - Funkcja logowania
 * @property {Function} signOut - Funkcja wylogowania
 */

/** @type {React.Context<AuthContextType>} */
const AuthContext = createContext();

/**
 * Hook dostarczający kontekst autoryzacji
 * @returns {AuthContextType} Kontekst autoryzacji
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Provider kontekstu autoryzacji
 * @param {Object} props - Właściwości komponentu
 * @param {React.ReactNode} props.children - Komponenty potomne
 * @returns {JSX.Element} Provider kontekstu autoryzacji
 */
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Pobierz aktualną sesję
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Błąd podczas inicjalizacji autoryzacji:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Nasłuchuj zmian sesji
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Rejestracja nowego użytkownika
   * @param {string} email - Adres email
   * @param {string} password - Hasło
   * @returns {Promise<Object>} Wynik rejestracji
   */
  const signUp = async (email, password) => {
    try {
      setError(null);
      const { data, error } = await supabaseClient.auth.signUp({ email, password });
      if (error) throw error;
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  /**
   * Logowanie użytkownika
   * @param {string} email - Adres email
   * @param {string} password - Hasło
   * @returns {Promise<Object>} Wynik logowania
   */
  const signIn = async (email, password) => {
    try {
      setError(null);
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  /**
   * Wylogowanie użytkownika
   * @returns {Promise<Object>} Wynik wylogowania
   */
  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    session,
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!session?.access_token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 