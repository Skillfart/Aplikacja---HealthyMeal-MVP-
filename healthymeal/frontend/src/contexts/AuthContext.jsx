import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    let mounted = true;

    // Pobierz początkową sesję
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) throw error;
          setSession(session);
          if (session) {
            console.log('Session data:', {
              access_token: session.access_token ? '✅ Present' : '❌ Missing',
              user: session.user ? '✅ Present' : '❌ Missing'
            });
            setUser({
              ...session.user,
              access_token: session.access_token
            });
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        if (mounted) {
          console.error('Błąd podczas pobierania sesji:', error);
          setError(error.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Nasłuchuj na zmiany w autoryzacji
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        console.log('Zmiana stanu autoryzacji:', event);
        console.log('Session data:', {
          access_token: session?.access_token ? '✅ Present' : '❌ Missing',
          user: session?.user ? '✅ Present' : '❌ Missing'
        });
        
        setSession(session);
        if (session) {
          setUser({
            ...session.user,
            access_token: session.access_token
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    loading,
    error,
    signIn: async (email, password) => {
      try {
        setError(null);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        
        console.log('Sign in data:', {
          access_token: data.session?.access_token ? '✅ Present' : '❌ Missing',
          user: data.user ? '✅ Present' : '❌ Missing'
        });
        
        setSession(data.session);
        if (data.session) {
          setUser({
            ...data.user,
            access_token: data.session.access_token
          });
        }
        return { error: null };
      } catch (error) {
        console.error('Błąd logowania:', error);
        setError(error.message);
        return { error };
      }
    },
    signUp: async (email, password) => {
      try {
        setError(null);
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;
        
        console.log('Sign up data:', {
          access_token: data.session?.access_token ? '✅ Present' : '❌ Missing',
          user: data.user ? '✅ Present' : '❌ Missing'
        });
        
        setSession(data.session);
        if (data.session) {
          setUser({
            ...data.user,
            access_token: data.session.access_token
          });
        }
        return { error: null };
      } catch (error) {
        console.error('Błąd rejestracji:', error);
        setError(error.message);
        return { error };
      }
    },
    signOut: async () => {
      try {
        setError(null);
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
        setSession(null);
        return { error: null };
      } catch (error) {
        console.error('Błąd wylogowania:', error);
        setError(error.message);
        return { error };
      }
    },
    refreshData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 