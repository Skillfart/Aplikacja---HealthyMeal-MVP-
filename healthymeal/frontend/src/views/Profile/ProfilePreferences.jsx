import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import supabase from '../../config/supabaseClient';
import styles from './Profile.module.css';

const ProfilePreferences = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preferences, setPreferences] = useState({
    diet_type: 'normal',
    max_carbs: 0,
    excluded_products: [],
    allergens: []
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        if (!user) throw new Error('Brak zalogowanego użytkownika');

        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Błąd pobierania preferencji:', error);
          throw error;
        }

        if (data) {
          setPreferences({
            diet_type: data.diet_type || 'normal',
            max_carbs: data.max_carbs || 0,
            excluded_products: data.excluded_products || [],
            allergens: data.allergens || []
          });
        }
      } catch (err) {
        console.error('Błąd:', err);
        setError(err.message || 'Nie udało się pobrać preferencji');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) throw new Error('Brak zalogowanego użytkownika');

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          diet_type: preferences.diet_type,
          max_carbs: parseInt(preferences.max_carbs) || 0,
          excluded_products: preferences.excluded_products,
          allergens: preferences.allergens,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      navigate('/profile');
    } catch (err) {
      console.error('Błąd zapisywania preferencji:', err);
      setError(err.message || 'Nie udało się zapisać preferencji');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (e, field) => {
    const value = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return <div className={styles.loading}>Ładowanie...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <h2>Edycja preferencji dietetycznych</h2>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="diet_type">Typ diety:</label>
          <select
            id="diet_type"
            name="diet_type"
            value={preferences.diet_type}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="normal">Normalna</option>
            <option value="vegetarian">Wegetariańska</option>
            <option value="vegan">Wegańska</option>
            <option value="keto">Ketogeniczna</option>
            <option value="paleo">Paleo</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="max_carbs">Maksymalna liczba węglowodanów (g):</label>
          <input
            type="number"
            id="max_carbs"
            name="max_carbs"
            value={preferences.max_carbs}
            onChange={handleChange}
            min="0"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="excluded_products">Wykluczone produkty (oddzielone przecinkami):</label>
          <textarea
            id="excluded_products"
            value={preferences.excluded_products.join(', ')}
            onChange={(e) => handleArrayChange(e, 'excluded_products')}
            className={styles.textarea}
            placeholder="np. mleko, jajka, orzechy"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="allergens">Alergeny (oddzielone przecinkami):</label>
          <textarea
            id="allergens"
            value={preferences.allergens.join(', ')}
            onChange={(e) => handleArrayChange(e, 'allergens')}
            className={styles.textarea}
            placeholder="np. gluten, laktoza, orzechy"
          />
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.saveButton} disabled={loading}>
            {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/profile')}
            className={styles.cancelButton}
            disabled={loading}
          >
            Anuluj
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePreferences; 