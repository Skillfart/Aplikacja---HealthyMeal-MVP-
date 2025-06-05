import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import supabase from '../../config/supabaseClient';
import styles from './Profile.module.css';

export const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Pobierz dane użytkownika z Supabase
        const { data: { user: userData }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;

        // Pobierz dodatkowe dane profilu
        const { data: profileData, error: profileError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userData.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // Ignoruj błąd "nie znaleziono"
          throw profileError;
        }

        setUserData({
          ...userData,
          preferences: profileData || {
            dietType: 'normal',
            maxCarbs: 0,
            excludedProducts: [],
            allergens: []
          }
        });
        setLoading(false);
      } catch (err) {
        console.error('Błąd pobierania danych:', err);
        setError('Nie udało się pobrać danych profilu');
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleEditPreferences = () => {
    navigate('/profile/preferences');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nie określono';
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className={styles.loading}>Ładowanie...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!userData) {
    return <div className={styles.error}>Nie znaleziono danych profilu</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <h2>Profil użytkownika</h2>
      <div className={styles.section}>
        <h3>Dane podstawowe</h3>
        <div className={styles.infoItem}>
          <span className={styles.label}>Email:</span>
          <span className={styles.value}>{userData.email}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Data rejestracji:</span>
          <span className={styles.value}>{formatDate(userData.created_at)}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Ostatnia aktualizacja:</span>
          <span className={styles.value}>{formatDate(userData.updated_at)}</span>
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
          onClick={handleEditPreferences}
          className={styles.editButton}
        >
          Edytuj preferencje
        </button>
      </div>
    </div>
  );
};

export default Profile; 