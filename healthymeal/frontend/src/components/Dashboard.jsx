import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user, session, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        });
        setProfile(response.data);
      } catch (error) {
        console.error('Błąd podczas pobierania profilu:', error);
        setError('Nie udało się pobrać danych profilu');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Błąd wylogowania:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        name: profile.name
      }, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/preferences`, profile.preferences, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
    } catch (err) {
      console.error('Błąd zapisu profilu:', err);
      setError('Nie udało się zapisać profilu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <h2>Ładowanie danych...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>HealthyMeal Dashboard</h1>
        <button onClick={handleSignOut} className="logout-button">
          Wyloguj się
        </button>
      </header>

      <main className="dashboard-content">
        {error ? (
          <div className="error-message">
            {error}
          </div>
        ) : (
          <>
            <section className="user-info">
              <h2>Witaj, {profile?.name || user?.email}!</h2>
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label htmlFor="name">Imię</label>
                  <input
                    id="name"
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                {profile?.preferences && (
                  <div className="preferences">
                    <h3>Twoje preferencje:</h3>
                    <div className="form-group">
                      <label htmlFor="dietType">Dieta</label>
                      <select
                        id="dietType"
                        value={profile.preferences.dietType}
                        onChange={(e) => setProfile({
                          ...profile,
                          preferences: { ...profile.preferences, dietType: e.target.value }
                        })}
                      >
                        <option value="normal">normal</option>
                        <option value="vegetarian">vegetarian</option>
                        <option value="vegan">vegan</option>
                        <option value="lowCarb">lowCarb</option>
                        <option value="keto">keto</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="maxCarbs">Max węglowodanów (g)</label>
                      <input
                        id="maxCarbs"
                        type="number"
                        value={profile.preferences.maxCarbs}
                        onChange={(e) => setProfile({
                          ...profile,
                          preferences: { ...profile.preferences, maxCarbs: e.target.value }
                        })}
                      />
                    </div>
                    <button type="submit" className="login-button" disabled={saving}>
                      {saving ? 'Zapisywanie...' : 'Zapisz profil'}
                    </button>
                  </div>
                )}
              </form>
            </section>

            <section className="ai-usage">
              <h3>Wykorzystanie AI</h3>
              <p>Dzisiejsze użycia: {profile?.aiUsage?.count || 0}/5</p>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
