import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export const useAIUsage = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState({ current: 0, limit: 5, remaining: 5 });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUsage = useCallback(async () => {
    if (!user?.access_token) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/api/users/ai-usage', {
        headers: {
          Authorization: `Bearer ${user.access_token}`
        }
      });
      setUsage(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError('Nie udało się pobrać danych o użyciu AI');
      console.error('Błąd podczas pobierania danych o użyciu AI:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.access_token]);

  const incrementUsage = useCallback(async () => {
    if (!user?.access_token) return;
    
    try {
      setLoading(true);
      const response = await axios.post('/api/users/ai-usage', {}, {
        headers: {
          Authorization: `Bearer ${user.access_token}`
        }
      });
      setUsage(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Przekroczono dzienny limit użycia AI');
      } else {
        setError('Nie udało się zaktualizować licznika AI');
      }
      console.error('Błąd podczas inkrementacji licznika AI:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.access_token]);

  return {
    usage,
    error,
    loading,
    fetchUsage,
    incrementUsage
  };
}; 