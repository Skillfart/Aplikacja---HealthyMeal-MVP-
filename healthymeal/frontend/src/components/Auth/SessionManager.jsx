import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import supabase from '../../config/supabaseClient';

const SessionManager = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.admin.listUserSessions(user.id);
      
      if (error) throw error;
      
      setSessions(data);
    } catch (error) {
      console.error('Błąd pobierania sesji:', error);
      toast.error('Nie udało się pobrać listy sesji');
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.admin.deleteSession(sessionId);
      
      if (error) throw error;
      
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Sesja została zakończona');
    } catch (error) {
      console.error('Błąd kończenia sesji:', error);
      toast.error('Nie udało się zakończyć sesji');
    } finally {
      setLoading(false);
    }
  };

  const terminateAllOtherSessions = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.admin.deleteAllSessions(user.id);
      
      if (error) throw error;
      
      // Pozostaw tylko aktualną sesję
      const currentSession = sessions.find(session => session.id === supabase.auth.session()?.id);
      setSessions(currentSession ? [currentSession] : []);
      toast.success('Wszystkie inne sesje zostały zakończone');
    } catch (error) {
      console.error('Błąd kończenia wszystkich sesji:', error);
      toast.error('Nie udało się zakończyć wszystkich sesji');
    } finally {
      setLoading(false);
    }
  };

  const formatLastActivity = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pl-PL');
  };

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Aktywne sesje
      </h2>

      <div className="space-y-4">
        {sessions.map(session => (
          <div key={session.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {session.browser} na {session.os}
                </p>
                <p className="text-xs text-gray-500">
                  Ostatnia aktywność: {formatLastActivity(session.last_activity)}
                </p>
                <p className="text-xs text-gray-500">
                  IP: {session.ip_address}
                </p>
              </div>
              {session.id !== supabase.auth.session()?.id && (
                <button
                  onClick={() => terminateSession(session.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                  disabled={loading}
                >
                  Zakończ
                </button>
              )}
            </div>
          </div>
        ))}

        {sessions.length > 1 && (
          <button
            onClick={terminateAllOtherSessions}
            className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            disabled={loading}
          >
            Zakończ wszystkie inne sesje
          </button>
        )}

        {sessions.length === 0 && (
          <p className="text-center text-gray-500">
            Brak aktywnych sesji
          </p>
        )}
      </div>
    </div>
  );
};

export default SessionManager; 