import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Profile.module.css';

export const Preferences = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [preferences, setPreferences] = useState({
    dietType: 'normal',
    maxCarbs: 0,
    excludedProducts: [],
    allergens: []
  });
  
  const [excludedProductInput, setExcludedProductInput] = useState('');
  
  const dietTypes = [
    { value: 'normal', label: 'Normalna' },
    { value: 'lowCarb', label: 'Niskowęglowodanowa' },
    { value: 'keto', label: 'Ketogeniczna' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'vegetarian', label: 'Wegetariańska' },
    { value: 'vegan', label: 'Wegańska' },
    { value: 'glutenFree', label: 'Bezglutenowa' },
    { value: 'dairyFree', label: 'Bez nabiału' }
  ];
  
  const allergenOptions = [
    { value: 'gluten', label: 'Gluten' },
    { value: 'dairy', label: 'Nabiał' },
    { value: 'nuts', label: 'Orzechy' },
    { value: 'eggs', label: 'Jajka' },
    { value: 'soy', label: 'Soja' },
    { value: 'shellfish', label: 'Skorupiaki' },
    { value: 'fish', label: 'Ryby' },
    { value: 'peanuts', label: 'Orzeszki ziemne' }
  ];
  
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Nie jesteś zalogowany. Zaloguj się, aby edytować preferencje.');
          setLoading(false);
          return;
        }
        
        const response = await axios.get('/api/users/preferences', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Upewnij się, że response.data jest obiektem z odpowiednimi polami
        const data = response.data || {};
        setPreferences({
          dietType: data.dietType || 'normal',
          maxCarbs: data.maxCarbs || 0,
          excludedProducts: Array.isArray(data.excludedProducts) ? data.excludedProducts : [],
          allergens: Array.isArray(data.allergens) ? data.allergens : []
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setError('Nie udało się pobrać preferencji użytkownika. Spróbuj ponownie później.');
        setLoading(false);
        
        // W przypadku błędu użyj domyślnych wartości
        setPreferences({
          dietType: 'normal',
          maxCarbs: 0,
          excludedProducts: [],
          allergens: []
        });
      }
    };
    
    fetchPreferences();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value === '' ? 0 : parseInt(value)
    }));
  };
  
  const toggleAllergen = (allergen) => {
    setPreferences(prev => {
      // Upewnij się, że allergens istnieje i jest tablicą
      const allergens = Array.isArray(prev.allergens) ? [...prev.allergens] : [];
      
      if (allergens.includes(allergen)) {
        return {
          ...prev,
          allergens: allergens.filter(a => a !== allergen)
        };
      } else {
        return {
          ...prev,
          allergens: [...allergens, allergen]
        };
      }
    });
  };
  
  const addExcludedProduct = () => {
    if (excludedProductInput.trim()) {
      setPreferences(prev => {
        // Upewnij się, że excludedProducts istnieje i jest tablicą
        const excludedProducts = Array.isArray(prev.excludedProducts) ? [...prev.excludedProducts] : [];
        
        if (!excludedProducts.includes(excludedProductInput.trim())) {
          return {
            ...prev,
            excludedProducts: [...excludedProducts, excludedProductInput.trim()]
          };
        }
        return prev;
      });
      setExcludedProductInput('');
    }
  };
  
  const removeExcludedProduct = (product) => {
    setPreferences(prev => {
      // Upewnij się, że excludedProducts istnieje i jest tablicą
      const excludedProducts = Array.isArray(prev.excludedProducts) ? [...prev.excludedProducts] : [];
      
      return {
        ...prev,
        excludedProducts: excludedProducts.filter(p => p !== product)
      };
    });
  };
  
  const handleReturn = () => {
    navigate('/profile');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Nie jesteś zalogowany. Zaloguj się, aby zapisać preferencje.');
        setSaving(false);
        return;
      }
      
      // Upewnij się, że wysyłane dane mają właściwą strukturę
      const dataToSend = {
        dietType: preferences.dietType || 'normal',
        maxCarbs: preferences.maxCarbs || 0,
        excludedProducts: Array.isArray(preferences.excludedProducts) ? preferences.excludedProducts : [],
        allergens: Array.isArray(preferences.allergens) ? preferences.allergens : []
      };
      
      await axios.put('/api/users/preferences', dataToSend, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccess(true);
      setSaving(false);
      
      // Natychmiastowe przekierowanie, bez opóźnienia
      navigate('/profile');
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Nie udało się zapisać preferencji. Spróbuj ponownie później.');
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className={styles.loading}>Ładowanie preferencji...</div>;
  }
  
  return (
    <div className={styles.profileContainer}>
      <div className={styles.navBar}>
        <button 
          onClick={handleReturn} 
          className={styles.backButton}
        >
          ← Powrót do profilu
        </button>
      </div>
      
      <h2>Edycja preferencji dietetycznych</h2>
      
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>Preferencje zostały zapisane! Za chwilę nastąpi przekierowanie.</div>}
      
      <form onSubmit={handleSubmit}>
        <div className={styles.section}>
          <h3>Podstawowe preferencje</h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="dietType">Typ diety:</label>
            <select 
              id="dietType" 
              name="dietType" 
              value={preferences.dietType || 'normal'}
              onChange={handleChange}
            >
              {dietTypes.map(diet => (
                <option key={diet.value} value={diet.value}>
                  {diet.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="maxCarbs">Maksymalna liczba węglowodanów (g):</label>
            <input 
              type="number" 
              id="maxCarbs" 
              name="maxCarbs"
              min="0"
              value={preferences.maxCarbs || 0}
              onChange={handleNumberChange}
            />
          </div>
        </div>
        
        <div className={styles.section}>
          <h3>Wykluczone produkty</h3>
          
          <div className={styles.tagInput}>
            <input
              type="text"
              value={excludedProductInput}
              onChange={(e) => setExcludedProductInput(e.target.value)}
              placeholder="Wpisz nazwę produktu"
            />
            <button 
              type="button" 
              onClick={addExcludedProduct}
              className={styles.addButton}
            >
              Dodaj
            </button>
          </div>
          
          <div className={styles.tagsList}>
            {Array.isArray(preferences.excludedProducts) && preferences.excludedProducts.map(product => (
              <div key={product} className={styles.tag}>
                <span>{product}</span>
                <button 
                  type="button" 
                  onClick={() => removeExcludedProduct(product)}
                  className={styles.removeTag}
                >
                  ✕
                </button>
              </div>
            ))}
            {!Array.isArray(preferences.excludedProducts) || preferences.excludedProducts.length === 0 && (
              <p className={styles.noItems}>Brak wykluczonych produktów</p>
            )}
          </div>
        </div>
        
        <div className={styles.section}>
          <h3>Alergeny</h3>
          
          <div className={styles.checkboxGroup}>
            {allergenOptions.map(allergen => (
              <div key={allergen.value} className={styles.checkbox}>
                <input
                  type="checkbox"
                  id={`allergen-${allergen.value}`}
                  checked={Array.isArray(preferences.allergens) && preferences.allergens.includes(allergen.value)}
                  onChange={() => toggleAllergen(allergen.value)}
                />
                <label htmlFor={`allergen-${allergen.value}`}>{allergen.label}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.formActions}>
          <button 
            type="button" 
            onClick={handleReturn}
            className={`${styles.button} ${styles.cancelButton}`}
            disabled={saving}
          >
            Anuluj
          </button>
          <button 
            type="submit" 
            className={`${styles.button} ${styles.saveButton}`}
            disabled={saving}
          >
            {saving ? 'Zapisywanie...' : 'Zapisz preferencje'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Preferences; 