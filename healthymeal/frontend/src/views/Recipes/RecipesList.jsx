import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './RecipesList.module.css';

const RecipesList = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    difficulty: '',
    maxPrepTime: '',
    tags: []
  });
  const [activeTags, setActiveTags] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Construct API URL with search and filters
        let apiUrl = `/api/recipes`;
        const queryParams = [];

        if (searchTerm) {
          queryParams.push(`search=${encodeURIComponent(searchTerm)}`);
        }

        if (filters.difficulty) {
          queryParams.push(`difficulty=${encodeURIComponent(filters.difficulty)}`);
        }

        if (filters.maxPrepTime) {
          queryParams.push(`maxPreparationTime=${encodeURIComponent(filters.maxPrepTime)}`);
        }

        if (activeTags.length > 0) {
          const tagsParam = activeTags.join(',');
          queryParams.push(`tags=${encodeURIComponent(tagsParam)}`);
        }

        if (queryParams.length > 0) {
          apiUrl += `?${queryParams.join('&')}`;
        }

        console.log('Wysyłanie zapytania do:', apiUrl);
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Otrzymana odpowiedź:', response.data);
        
        // Sprawdź, czy dane są w oczekiwanej strukturze
        if (response.data && response.data.recipes) {
          setRecipes(response.data.recipes);
        } else if (Array.isArray(response.data)) {
          // Jeśli API zwraca bezpośrednio tablicę przepisów
          setRecipes(response.data);
        } else {
          console.error('Nieoczekiwana struktura danych:', response.data);
          setRecipes([]);
          setError('Otrzymano nieprawidłowy format danych z serwera.');
        }
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError('Wystąpił błąd podczas pobierania przepisów. Spróbuj ponownie później.');
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [searchTerm, filters, activeTags, navigate]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = (tag) => {
    if (!activeTags.includes(tag) && tag.trim() !== '') {
      setActiveTags(prev => [...prev, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setActiveTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      handleAddTag(e.target.value.trim());
      e.target.value = '';
    }
  };

  const viewRecipe = (recipeId) => {
    navigate(`/dashboard/recipes/${recipeId}`);
  };

  const editRecipe = (recipeId, e) => {
    e.stopPropagation();
    navigate(`/dashboard/recipes/edit/${recipeId}`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Ładowanie przepisów...</p>
      </div>
    );
  }

  return (
    <div className={styles.recipesListContainer}>
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <h1>Moje Przepisy</h1>
            <div className={styles.actionButtons}>
              <Link to="/dashboard/recipes/add" className={styles.addButton}>
                Dodaj nowy przepis
              </Link>
              <Link to="/dashboard/recipes/compare" className={styles.modifyButton}>
                Porównaj przepisy
              </Link>
            </div>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.searchAndFilters}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Szukaj przepisów..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <div className={styles.filters}>
              <select
                name="difficulty"
                value={filters.difficulty}
                onChange={handleFilterChange}
              >
                <option value="">Trudność: Wszystkie</option>
                <option value="easy">Łatwy</option>
                <option value="medium">Średni</option>
                <option value="hard">Trudny</option>
              </select>

              <select
                name="maxPrepTime"
                value={filters.maxPrepTime}
                onChange={handleFilterChange}
              >
                <option value="">Czas przygotowania: Wszystkie</option>
                <option value="15">Do 15 minut</option>
                <option value="30">Do 30 minut</option>
                <option value="60">Do 1 godziny</option>
                <option value="120">Do 2 godzin</option>
              </select>

              <input
                type="text"
                placeholder="Dodaj tag i naciśnij Enter"
                onKeyDown={handleKeyDown}
              />
            </div>

            {activeTags.length > 0 && (
              <div className={styles.activeTags}>
                {activeTags.map((tag, index) => (
                  <span
                    key={index}
                    className={styles.activeTag}
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} &#x2715;
                  </span>
                ))}
              </div>
            )}
          </div>

          {recipes.length === 0 ? (
            <div className={styles.emptyState}>
              <h2>Nie masz jeszcze żadnych przepisów</h2>
              <p>Dodaj swój pierwszy przepis, aby zacząć gotować zdrowiej!</p>
              <Link to="/dashboard/recipes/add" className={styles.actionButton}>
                Dodaj przepis
              </Link>
            </div>
          ) : (
            <div className={styles.recipesGrid}>
              {recipes.map(recipe => (
                <div
                  key={recipe._id}
                  className={styles.recipeCard}
                  onClick={() => viewRecipe(recipe._id)}
                >
                  <h3 className={styles.recipeTitle}>{recipe.title}</h3>
                  <div className={styles.recipeDetails}>
                    <span>
                      {recipe.difficulty === 'easy' && 'Łatwy'}
                      {recipe.difficulty === 'medium' && 'Średni'}
                      {recipe.difficulty === 'hard' && 'Trudny'}
                    </span>
                    <span>{recipe.preparationTime} min</span>
                    <span>{recipe.servings} porcji</span>
                  </div>
                  
                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className={styles.recipeTags}>
                      {recipe.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className={styles.tag}>{tag}</span>
                      ))}
                      {recipe.tags.length > 3 && (
                        <span className={styles.tag}>+{recipe.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                  
                  <div className={styles.compareLink}>
                    <Link
                      to={`/dashboard/recipes/compare?recipeId=${recipe._id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Porównaj z innym przepisem
                    </Link>
                  </div>
                  
                  <div className={styles.recipeActions}>
                    <button className={styles.viewButton}>
                      Zobacz
                    </button>
                    <button
                      className={styles.editButton}
                      onClick={(e) => editRecipe(recipe._id, e)}
                    >
                      Edytuj
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RecipesList; 