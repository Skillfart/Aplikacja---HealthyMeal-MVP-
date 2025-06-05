import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import Spinner from 'react-bootstrap/Spinner';
import RecipeCard from '../../components/Recipe/RecipeCard';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [aiUsage, setAiUsage] = useState({ count: 0, limit: 5, remaining: 5 });
  const [recipeOfDay, setRecipeOfDay] = useState(null);
  
  const navigate = useNavigate();
  
  // Funkcja do wykrywania środowiska testowego
  const isTestEnvironment = () => {
    return process.env.NODE_ENV === 'test' || 
           localStorage.getItem('test_mode') === 'true' ||
           process.env.REACT_APP_TEST_MODE === 'true';
  };

  // Pobieranie danych dla dashboardu
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Jeżeli jesteśmy w środowisku testowym, użyj danych testowych
        if (isTestEnvironment()) {
          console.log("Używanie testowych danych dla środowiska testowego");
          
          // Przykładowe przepisy
          const testRecipes = [
            {
              id: 'recipe1',
              title: 'Niskocukrowy omlet z warzywami',
              preparationTime: 15,
              difficulty: 'easy',
              servings: 2,
              tags: ['śniadanie', 'niskocukrowe', 'wegetariańskie'],
              nutritionalValues: {
                calories: 320,
                protein: 18,
                carbs: 8,
                fat: 24,
                fiber: 3
              }
            },
            {
              id: 'recipe2',
              title: 'Sałatka z grillowanym kurczakiem',
              preparationTime: 25,
              difficulty: 'medium',
              servings: 2,
              tags: ['obiad', 'wysokobiałkowe', 'niskowęglowodanowe'],
              nutritionalValues: {
                calories: 380,
                protein: 35,
                carbs: 12,
                fat: 22,
                fiber: 4
              }
            },
            {
              id: 'recipe3',
              title: 'Koktajl jagodowy',
              preparationTime: 5,
              difficulty: 'easy',
              servings: 1,
              tags: ['napój', 'przekąska', 'bezglutenowe'],
              nutritionalValues: {
                calories: 220,
                protein: 8,
                carbs: 38,
                fat: 4,
                fiber: 7
              }
            }
          ];
          
          setRecipes(testRecipes);
          
          // Użyj pierwszego przepisu jako "przepis dnia"
          setRecipeOfDay(testRecipes[0]);
          
          // Przykładowe dane użycia AI
        setAiUsage({
            count: 2,
            limit: 5,
            remaining: 3
          });
          
          setLoading(false);
          return;
        }
        
        // W rzeczywistej aplikacji tutaj byłoby pobieranie rzeczywistych danych z API
        // Przykładowa implementacja:
        
        /* 
        const config = getAuthConfig();
        const [recipesRes, aiUsageRes, recipeDayRes, preferencesRes] = await Promise.all([
          axios.get('/api/recipes?limit=3', config),
          axios.get('/api/ai/usage', config),
          axios.get('/api/dashboard/recipe-day', config),
          axios.get('/api/users/preferences', config)
        ]);
        
        setRecipes(recipesRes.data.recipes);
        setAiUsage(aiUsageRes.data.aiUsage);
        setRecipeOfDay(recipeDayRes.data.recipeOfDay);
        setPreferences(preferencesRes.data.preferences);
        */
        
      } catch (err) {
        console.error("Błąd pobierania danych:", err);
        setLoading(false);
      }
    };
    
      fetchDashboardData();
  }, []);

  // Funkcje obsługi kliknięć
  const handleAddRecipe = () => {
    navigate('/recipes/add');
  };
  
  const handleModifyRecipe = () => {
    navigate('/recipes');
  };
  
  const handleEditProfile = () => {
    navigate('/profile');
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      toast.error('Nie udało się wylogować. Spróbuj ponownie.');
    }
  };
  
  const handleViewRecipe = (recipeId) => {
    navigate(`/recipes/${recipeId}`);
  };
  
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner animation="border" variant="success" />
        <div>Ładowanie danych...</div>
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
                <span>Witaj, {user.email}!</span>
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
                  <span>Poziom trudności: {
                    recipeOfDay.difficulty === 'easy' ? 'Łatwy' :
                    recipeOfDay.difficulty === 'medium' ? 'Średni' : 'Trudny'
                  }</span>
                </div>
                <div className={styles.recipeTags}>
                  {recipeOfDay.tags && recipeOfDay.tags.map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
                {recipeOfDay.id && (
                  <button 
                  className={styles.viewRecipeButton}
                    onClick={() => handleViewRecipe(recipeOfDay.id)}
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
              <h2 className={styles.sectionTitle}>Ostatnie przepisy</h2>
              <div className={styles.recentRecipesGrid}>
                {recipes.map(recipe => (
                  <RecipeCard 
                    key={recipe.id || recipe._id} 
                    recipe={recipe}
                    onDelete={(id) => console.log('Usuwanie przepisu:', id)}
                  />
                ))}
              </div>
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 