import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SingleRecipe } from './SingleRecipe';
import styles from './RecipeDetails.module.css';
import { supabase } from '../../lib/supabase.js';

export const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        
        // Sprawdź, czy użytkownik jest zalogowany
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          navigate('/');
          return;
        }
        
        // Zamiast pobierać z API, użyjmy przykładowych danych
        // W rzeczywistej aplikacji tutaj byłoby pobieranie z Supabase
        
        // Znajdź demo przepis na podstawie ID (dla demonstracji)
        const demoRecipes = {
          'recipe1': {
            id: 'recipe1',
            title: 'Niskocukrowy omlet z warzywami',
            preparationTime: 15,
            difficulty: 'łatwy',
            servings: 2,
            tags: ['śniadanie', 'niskocukrowe', 'wegetariańskie'],
            ingredients: [
              { name: 'Jajka', quantity: 3, unit: 'szt.' },
              { name: 'Papryka czerwona', quantity: 0.5, unit: 'szt.' },
              { name: 'Cebula', quantity: 0.5, unit: 'szt.' },
              { name: 'Szpinak', quantity: 1, unit: 'garść' },
              { name: 'Sól', quantity: 1, unit: 'szczypta' },
              { name: 'Pieprz', quantity: 1, unit: 'szczypta' },
              { name: 'Oliwa z oliwek', quantity: 1, unit: 'łyżka' }
            ],
            steps: [
              { number: 1, description: 'Umyj i pokrój warzywa w drobną kostkę.' },
              { number: 2, description: 'Roztrzep jajka w misce, dodaj sól i pieprz.' },
              { number: 3, description: 'Rozgrzej oliwę na patelni i podsmaż warzywa przez 2-3 minuty.' },
              { number: 4, description: 'Wlej roztrzepane jajka na patelnię i smaż przez 2 minuty.' },
              { number: 5, description: 'Przykryj patelnię pokrywką i smaż przez kolejne 2-3 minuty, aż omlet się zetnie.' }
            ],
            nutritionalValues: {
              calories: 320,
              protein: 18,
              carbs: 8,
              fat: 24,
              fiber: 3
            },
            description: 'Pyszny i lekki omlet z warzywami, idealny dla osób kontrolujących poziom cukru we krwi.'
          },
          'recipe2': {
            id: 'recipe2',
            title: 'Sałatka z grillowanym kurczakiem',
            preparationTime: 25,
            difficulty: 'średni',
            servings: 2,
            tags: ['obiad', 'wysokobiałkowe', 'niskowęglowodanowe'],
            ingredients: [
              { name: 'Pierś z kurczaka', quantity: 1, unit: 'szt.' },
              { name: 'Mieszanka sałat', quantity: 200, unit: 'g' },
              { name: 'Pomidor', quantity: 1, unit: 'szt.' },
              { name: 'Ogórek', quantity: 0.5, unit: 'szt.' },
              { name: 'Czerwona cebula', quantity: 0.5, unit: 'szt.' },
              { name: 'Oliwa z oliwek', quantity: 2, unit: 'łyżki' },
              { name: 'Sok z cytryny', quantity: 1, unit: 'łyżka' },
              { name: 'Przyprawy do kurczaka', quantity: 1, unit: 'łyżeczka' }
            ],
            steps: [
              { number: 1, description: 'Oprósz kurczaka przyprawami i grilluj przez 6-7 minut z każdej strony.' },
              { number: 2, description: 'Umyj i pokrój warzywa.' },
              { number: 3, description: 'Pokrój ugrillowanego kurczaka w paski.' },
              { number: 4, description: 'Połącz wszystkie składniki w misce.' },
              { number: 5, description: 'Polej oliwą i sokiem z cytryny, dopraw do smaku solą i pieprzem.' }
            ],
            nutritionalValues: {
              calories: 380,
              protein: 35,
              carbs: 12,
              fat: 22,
              fiber: 4
            },
            description: 'Pełnowartościowy posiłek bogaty w białko, świetny dla osób aktywnych fizycznie.'
          },
          'recipe3': {
            id: 'recipe3',
            title: 'Koktajl jagodowy',
            preparationTime: 5,
            difficulty: 'łatwy',
            servings: 1,
            tags: ['napój', 'przekąska', 'bezglutenowe'],
            ingredients: [
              { name: 'Jagody', quantity: 150, unit: 'g' },
              { name: 'Banan', quantity: 1, unit: 'szt.' },
              { name: 'Jogurt naturalny', quantity: 150, unit: 'ml' },
              { name: 'Mleko migdałowe', quantity: 100, unit: 'ml' },
              { name: 'Miód', quantity: 1, unit: 'łyżeczka' }
            ],
            steps: [
              { number: 1, description: 'Umyj jagody i oczyść banana.' },
              { number: 2, description: 'Włóż wszystkie składniki do blendera.' },
              { number: 3, description: 'Miksuj przez ok. 1 minutę, aż koktajl będzie gładki.' }
            ],
            nutritionalValues: {
              calories: 220,
              protein: 8,
              carbs: 38,
              fat: 4,
              fiber: 7
            },
            description: 'Orzeźwiający koktajl pełen antyoksydantów, idealny na śniadanie lub jako przekąska po treningu.'
          }
        };
        
        // Pobierz przykładowy przepis na podstawie ID
        const selectedRecipe = demoRecipes[id];
        
        if (selectedRecipe) {
          setRecipe(selectedRecipe);
        } else {
          setError('Przepis nie został znaleziony.');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Nie udało się pobrać przepisu. Spróbuj ponownie później.');
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, navigate]);

  const handleEdit = () => {
    navigate(`/recipes/${id}/edit`);
  };

  const handleModify = () => {
    navigate(`/recipes/${id}/modify`);
  };

  const handleDelete = async () => {
    if (window.confirm('Czy na pewno chcesz usunąć ten przepis?')) {
      try {
        // Tutaj w rzeczywistej aplikacji byłoby usuwanie z Supabase
        navigate('/recipes');
      } catch (err) {
        console.error('Error deleting recipe:', err);
        setError('Nie udało się usunąć przepisu. Spróbuj ponownie później.');
      }
    }
  };

  if (loading) {
    return <div className={styles.loading}>Ładowanie przepisu...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!recipe) {
    return <div className={styles.notFound}>Przepis nie został znaleziony.</div>;
  }

  return (
    <SingleRecipe 
      recipe={recipe} 
      onEdit={handleEdit} 
      onModify={handleModify} 
      onDelete={handleDelete} 
    />
  );
}; 