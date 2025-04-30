import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Profile.module.css';

export const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiUsage, setAiUsage] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Pobieranie danych użytkownika
        const userResponse = await axios.get('/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Pobieranie informacji o limitach AI
        const aiResponse = await axios.get('/api/ai/usage', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUserData(userResponse.data);
        setAiUsage(aiResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Nie udało się pobrać danych użytkownika. Spróbuj ponownie później.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEditPreferences = () => {
    navigate('/profile/preferences');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Brak danych';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Nieprawidłowa data';
      
      return new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Błąd formatowania daty:', error);
      return 'Nieprawidłowa data';
    }
  };

  if (loading) {
    return <div className={styles.loading}>Ładowanie danych użytkownika...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!userData) {
    return <div className={styles.notFound}>Dane użytkownika nie zostały znalezione.</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.navBar}>
        <button 
          onClick={handleGoToDashboard} 
          className={styles.backButton}
        >
          ← Powrót do dashboardu
        </button>
      </div>

      <h2>Profil użytkownika</h2>
      
      <div className={styles.section}>
        <h3>Dane podstawowe</h3>
        <div className={styles.infoItem}>
          <span className={styles.label}>Email:</span>
          <span className={styles.value}>{userData.email}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Data rejestracji:</span>
          <span className={styles.value}>{formatDate(userData.createdAt)}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Ostatnie logowanie:</span>
          <span className={styles.value}>{formatDate(userData.lastLogin)}</span>
        </div>
      </div>
      
      <div className={styles.section}>
        <h3>Preferencje dietetyczne</h3>
        <div className={styles.infoItem}>
          <span className={styles.label}>Typ diety:</span>
          <span className={styles.value}>{userData.preferences?.dietType || 'Nie określono'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Maksymalna liczba węglowodanów:</span>
          <span className={styles.value}>
            {userData.preferences?.maxCarbs ? `${userData.preferences.maxCarbs}g` : 'Nie określono'}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Wykluczone produkty:</span>
          <span className={styles.value}>
            {userData.preferences?.excludedProducts?.length > 0 
              ? userData.preferences.excludedProducts.join(', ') 
              : 'Brak'}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Alergeny:</span>
          <span className={styles.value}>
            {userData.preferences?.allergens?.length > 0 
              ? userData.preferences.allergens.join(', ') 
              : 'Brak'}
          </span>
        </div>
        
        <button 
          className={styles.editButton} 
          onClick={handleEditPreferences}
        >
          Edytuj preferencje
        </button>
      </div>
      
      {aiUsage && (
        <div className={styles.section}>
          <h3>Wykorzystanie AI</h3>
          <div className={styles.infoItem}>
            <span className={styles.label}>Liczba modyfikacji dzisiaj:</span>
            <span className={styles.value}>
              {aiUsage?.aiUsage?.count || 0} / {aiUsage?.dailyLimit || 5}
            </span>
          </div>
          <div className={styles.usageBar}>
            <div 
              className={styles.usageProgress} 
              style={{ 
                width: `${((aiUsage?.aiUsage?.count || 0) / (aiUsage?.dailyLimit || 5)) * 100}%` 
              }}
            />
          </div>
          <div className={styles.resetInfo}>
            Limit zostanie zresetowany o północy.
          </div>
        </div>
      )}

      <div className={styles.actionButtons}>
        <button 
          className={styles.dashboardButton} 
          onClick={handleGoToDashboard}
        >
          Przejdź do dashboardu
        </button>
      </div>
    </div>
  );
};

export default Profile; 