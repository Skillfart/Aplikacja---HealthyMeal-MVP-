import React, { useState, useEffect } from 'react';
import { useAuth } from '@frontend/contexts/AuthContext';
import axios from 'axios';

const FavoritesList = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    try {
      const response = await axios.get('/api/users/favorites', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      setFavorites(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Błąd ładowania ulubionych');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await axios.delete(`/api/users/favorites/${favoriteId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
    } catch (err) {
      setError(err.response?.data?.message || 'Błąd usuwania z ulubionych');
    }
  };

  if (loading) {
    return <div>Ładowanie ulubionych przepisów...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (favorites.length === 0) {
    return <div>Nie masz jeszcze ulubionych przepisów</div>;
  }

  return (
    <div className="favorites-list">
      <h2>Ulubione przepisy</h2>
      
      <div className="favorites-grid">
        {favorites.map((favorite) => (
          <div key={favorite.id} className="favorite-card">
            <h3>{favorite.recipe.title}</h3>
            <p>{favorite.recipe.description}</p>
            <p>Czas przygotowania: {favorite.recipe.prepTime} min</p>
            <p>Czas gotowania: {favorite.recipe.cookTime} min</p>
            
            <button
              onClick={() => handleRemoveFavorite(favorite.id)}
              className="remove-button"
              aria-label="usuń z ulubionych"
            >
              Usuń z ulubionych
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesList; 