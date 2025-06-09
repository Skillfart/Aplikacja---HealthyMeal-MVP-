import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:3031/api/users/profile', {
          headers: {
            Authorization: `Bearer ${user?.access_token}`
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
              {profile?.preferences && (
                <div className="preferences">
                  <h3>Twoje preferencje:</h3>
                  <ul>
                    <li>Dieta: {profile.preferences.dietType}</li>
                    <li>Max węglowodanów: {profile.preferences.maxCarbs}g</li>
                    <li>Wykluczone produkty: {profile.preferences.excludedProducts.join(', ') || 'brak'}</li>
                    <li>Alergeny: {profile.preferences.allergens.join(', ') || 'brak'}</li>
                  </ul>
                </div>
              )}
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