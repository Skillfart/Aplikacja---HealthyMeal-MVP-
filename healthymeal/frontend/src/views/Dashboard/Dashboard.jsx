import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { supabase } from '../../lib/supabase.js';

export const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [aiUsage, setAiUsage] = useState({ count: 0, limit: 5 });
  const [recipeOfDay, setRecipeOfDay] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Pobierz dane użytkownika z Supabase
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!sessionData.session) {
          window.location.href = '/';
          return;
        }
        
        // Pobierz profil użytkownika z Supabase
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }
        
        const userInfo = {
          id: userData.user.id,
          email: userData.user.email,
          name: userData.user.user_metadata?.name || userData.user.email,
          preferences: userData.user.user_metadata?.preferences || {
            dietType: 'normal',
            maxCarbs: 0,
            excludedProducts: [],
            allergens: []
          }
        };
        
        setUser(userInfo);
        
        // Ustaw demo dane dla AI Usage
        setAiUsage({
          count: 0,
          limit: 5
        });
        
        // Przykładowe przepisy
        const demoRecipes = [
          {
            id: 'recipe1',
            title: 'Niskocukrowy omlet z warzywami',
            preparationTime: 15,
            difficulty: 'łatwy',
            tags: ['śniadanie', 'niskocukrowe']
          },
          {
            id: 'recipe2',
            title: 'Sałatka z grillowanym kurczakiem',
            preparationTime: 25,
            difficulty: 'średni',
            tags: ['obiad', 'wysokobiałkowe']
          },
          {
            id: 'recipe3',
            title: 'Koktajl jagodowy',
            preparationTime: 5,
            difficulty: 'łatwy',
            tags: ['napój', 'przekąska']
          }
        ];
        
        setRecipes(demoRecipes);
        setRecipeOfDay(demoRecipes[0]);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Wystąpił problem podczas pobierania danych. Spróbuj odświeżyć stronę.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Błąd wylogowania:', error);
    }
  };

  const handleAddRecipe = () => {
    navigate('/recipes/new');
  };

  const handleModifyRecipe = () => {
    // Jeśli mamy przepisy, przekieruj do pierwszego
    if (recipes.length > 0) {
      navigate(`/recipes/${recipes[0].id}/modify`);
    } else {
      // Jeśli nie ma przepisów, najpierw przekieruj do dodania przepisu
      navigate('/recipes/new');
    }
  };

  const handleEditProfile = () => {
    navigate('/profile/preferences');
  };
  
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Ładowanie danych...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Wystąpił błąd</h2>
        <p>{error}</p>
        <button onClick={() => window.location.href = '/'}>
          Powrót do strony głównej
        </button>
      </div>
    );
  }
  
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.container}>
          <h1>HealthyMeal</h1>
          <div className={styles.userInfo}>
            {user && (
              <>
                <span>Witaj, {user.name || user.email}!</span>
                <button 
                  className={styles.logoutButton}
                  onClick={handleLogout}
                >
                  Wyloguj
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div className={styles.aiUsageContainer}>
            <h3>Dzienny limit modyfikacji AI</h3>
            <div className={styles.aiUsageTracker}>
              <div 
                className={styles.aiUsageBar} 
                style={{ width: `${(aiUsage.count / aiUsage.limit) * 100}%` }}
              ></div>
            </div>
            <p className={styles.aiUsageText}>
              Wykorzystano {aiUsage.count} z {aiUsage.limit} modyfikacji
            </p>
          </div>
          
          {recipeOfDay && (
            <div className={styles.recipeOfDaySection}>
              <h2 className={styles.sectionTitle}>Przepis dnia</h2>
              <div className={styles.recipeOfDayCard}>
                <h3>{recipeOfDay.title}</h3>
                <div className={styles.recipeDetails}>
                  <span>Czas: {recipeOfDay.preparationTime} min</span>
                  <span>Poziom trudności: {recipeOfDay.difficulty}</span>
                </div>
                <div className={styles.recipeTags}>
                  {recipeOfDay.tags && recipeOfDay.tags.map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
                {recipeOfDay.id !== 'placeholder' && (
                  <button 
                    className={styles.viewRecipeButton}
                    onClick={() => navigate(`/recipes/${recipeOfDay.id}`)}
                  >
                    Zobacz przepis
                  </button>
                )}
              </div>
            </div>
          )}
          
          <h2 className={styles.welcomeTitle}>Witaj w aplikacji HealthyMeal!</h2>
          <p className={styles.welcomeText}>
            Tutaj możesz zarządzać swoimi przepisami, modyfikować je zgodnie z preferencjami dietetycznymi
            i śledzić wartości odżywcze.
          </p>
          
          <div className={styles.dashboardGrid}>
            <div className={styles.dashboardCard}>
              <h3>Twoje przepisy</h3>
              <p>
                {recipes.length > 0 
                  ? `Masz już ${recipes.length} przepisów. Dodaj więcej lub zarządzaj istniejącymi.` 
                  : 'Nie masz jeszcze żadnych przepisów. Dodaj swój pierwszy przepis!'}
              </p>
              <button 
                className={styles.actionButton}
                onClick={handleAddRecipe}
              >
                Dodaj przepis
              </button>
            </div>
            
            <div className={styles.dashboardCard}>
              <h3>Modyfikuj przepis</h3>
              <p>Używaj AI do modyfikacji przepisów zgodnie z Twoimi preferencjami dietetycznymi.</p>
              <button 
                className={styles.actionButton}
                onClick={handleModifyRecipe}
              >
                Wypróbuj modyfikację
              </button>
            </div>
            
            <div className={styles.dashboardCard}>
              <h3>Ustawienia konta</h3>
              <p>Zarządzaj profilem i preferencjami dietetycznymi.</p>
              <button 
                className={styles.actionButton}
                onClick={handleEditProfile}
              >
                Edytuj profil
              </button>
            </div>
          </div>
          
          {recipes.length > 0 && (
            <div className={styles.recentRecipesSection}>
              <h2 className={styles.sectionTitle}>
                Ostatnie przepisy
                <Link to="/recipes" className={styles.viewAllLink}>
                  Zobacz wszystkie
                </Link>
              </h2>
              <div className={styles.recentRecipesGrid}>
                {recipes.map(recipe => (
                  <div key={recipe.id} className={styles.recipeCard} onClick={() => navigate(`/recipes/${recipe.id}`)}>
                    <h3 className={styles.recipeTitle}>{recipe.title}</h3>
                    <div className={styles.recipeDetails}>
                      {recipe.preparationTime && <span>Czas: {recipe.preparationTime} min</span>}
                      {recipe.difficulty && <span>Poziom trudności: {recipe.difficulty}</span>}
                    </div>
                    {recipe.tags && (
                      <div className={styles.recipeTags}>
                        {recipe.tags.slice(0, 3).map(tag => (
                          <span key={tag} className={styles.tag}>{tag}</span>
                        ))}
                        {recipe.tags.length > 3 && <span className={styles.tag}>+{recipe.tags.length - 3}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}; 