import React, { useState, useEffect } from 'react';
import { useAuth } from '@frontend/contexts/AuthContext';
import supabase from '../../config/supabaseClient';

const ProfileEditForm = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    preferences: {
      dietType: '',
      maxCarbs: 0,
      excludedProducts: [],
      allergens: []
    }
  });
  const [newProduct, setNewProduct] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.user_metadata?.name || '',
        email: user.email || '',
        preferences: {
          dietType: user.user_metadata?.preferences?.dietType || '',
          maxCarbs: user.user_metadata?.preferences?.maxCarbs || 0,
          excludedProducts: user.user_metadata?.preferences?.excludedProducts || [],
          allergens: user.user_metadata?.preferences?.allergens || []
        }
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (newProduct && !formData.preferences.excludedProducts.includes(newProduct)) {
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          excludedProducts: [...prev.preferences.excludedProducts, newProduct]
        }
      }));
      setNewProduct('');
    }
  };

  const handleRemoveProduct = (product) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        excludedProducts: prev.preferences.excludedProducts.filter(p => p !== product)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const { error } = await updateProfile({
        name: formData.name,
        preferences: formData.preferences
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profil został zaktualizowany' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Błąd aktualizacji profilu' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-edit-form">
      <div className="form-group">
        <label htmlFor="name">Imię</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          disabled
        />
      </div>

      <div className="form-group">
        <label htmlFor="dietType">Typ diety</label>
        <select
          id="dietType"
          name="preferences.dietType"
          value={formData.preferences.dietType}
          onChange={handleInputChange}
        >
          <option value="">Wybierz typ diety</option>
          <option value="standard">Standardowa</option>
          <option value="lowCarb">Niskowęglowodanowa</option>
          <option value="keto">Keto</option>
          <option value="vegan">Wegańska</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="maxCarbs">Maksymalna ilość węglowodanów (g)</label>
        <input
          type="number"
          id="maxCarbs"
          name="preferences.maxCarbs"
          value={formData.preferences.maxCarbs}
          onChange={handleInputChange}
          min="0"
        />
      </div>

      <div className="form-group">
        <label htmlFor="excludedProducts">Wykluczone produkty</label>
        <div className="excluded-products">
          {formData.preferences.excludedProducts.map((product, index) => (
            <div key={index} className="product-tag">
              {product}
              <button
                type="button"
                onClick={() => handleRemoveProduct(product)}
                aria-label="usuń produkt"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="add-product">
          <input
            type="text"
            value={newProduct}
            onChange={(e) => setNewProduct(e.target.value)}
            placeholder="Dodaj wykluczony produkt"
            aria-label="dodaj wykluczony produkt"
          />
          <button type="button" onClick={handleAddProduct}>+</button>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <button type="submit" className="save-button">
        Zapisz
      </button>
    </form>
  );
};

export default ProfileEditForm; 