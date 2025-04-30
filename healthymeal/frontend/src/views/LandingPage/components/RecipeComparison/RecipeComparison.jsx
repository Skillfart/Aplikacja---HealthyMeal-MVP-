import React, { useState } from 'react';
import { RecipeCard } from './RecipeCard';
import { ComparisonStats } from './ComparisonStats';
import styles from './RecipeComparison.module.css';

// Przykładowe przepisy do demonstracji
const exampleRecipes = [
  {
    id: 'example-1',
    name: 'Ciasto czekoladowe',
    modifiedName: 'Ciasto czekoladowe (niskowęglowodanowe)',
    original: {
      ingredients: [
        { name: 'mąka pszenna', amount: 200, unit: 'g', isModified: true },
        { name: 'cukier', amount: 150, unit: 'g', isModified: true },
        { name: 'masło', amount: 100, unit: 'g', isModified: false },
        { name: 'jajka', amount: 3, unit: 'szt.', isModified: false },
        { name: 'proszek do pieczenia', amount: 10, unit: 'g', isModified: false },
        { name: 'kakao', amount: 50, unit: 'g', isModified: false }
      ],
      nutrition: {
        calories: 350,
        carbs: 45,
        protein: 5,
        fat: 18
      }
    },
    modified: {
      ingredients: [
        { name: 'mąka migdałowa', amount: 200, unit: 'g', isModified: true, explanation: 'Niższa zawartość węglowodanów, wyższy indeks białkowy' },
        { name: 'erytrytol', amount: 100, unit: 'g', isModified: true, explanation: 'Zero kalorii, zero wpływu na poziom cukru we krwi' },
        { name: 'masło', amount: 100, unit: 'g', isModified: false },
        { name: 'jajka', amount: 3, unit: 'szt.', isModified: false },
        { name: 'proszek do pieczenia', amount: 10, unit: 'g', isModified: false },
        { name: 'kakao', amount: 50, unit: 'g', isModified: false }
      ],
      nutrition: {
        calories: 320,
        carbs: 12,
        protein: 9,
        fat: 26
      }
    },
    carbsReduction: 73
  },
  {
    id: 'example-2',
    name: 'Naleśniki',
    modifiedName: 'Naleśniki (keto)',
    original: {
      ingredients: [
        { name: 'mąka pszenna', amount: 200, unit: 'g', isModified: true },
        { name: 'mleko', amount: 300, unit: 'ml', isModified: true },
        { name: 'jajka', amount: 2, unit: 'szt.', isModified: false },
        { name: 'cukier', amount: 20, unit: 'g', isModified: true },
        { name: 'olej', amount: 20, unit: 'ml', isModified: false }
      ],
      nutrition: {
        calories: 220,
        carbs: 38,
        protein: 7,
        fat: 4
      }
    },
    modified: {
      ingredients: [
        { name: 'mąka kokosowa', amount: 50, unit: 'g', isModified: true, explanation: 'Niskowęglowodanowa alternatywa dla mąki pszennej' },
        { name: 'ser kremowy', amount: 100, unit: 'g', isModified: true, explanation: 'Dodaje kremowość i redukuje potrzebę mąki' },
        { name: 'jajka', amount: 4, unit: 'szt.', isModified: false },
        { name: 'erytrytol', amount: 10, unit: 'g', isModified: true, explanation: 'Naturalny słodzik bez kalorii' },
        { name: 'olej kokosowy', amount: 20, unit: 'ml', isModified: false }
      ],
      nutrition: {
        calories: 180,
        carbs: 6,
        protein: 10,
        fat: 14
      }
    },
    carbsReduction: 84
  }
];

export const RecipeComparison = () => {
  const [activeRecipeIndex, setActiveRecipeIndex] = useState(0);
  const [showTooltip, setShowTooltip] = useState(null);
  
  const activeRecipe = exampleRecipes[activeRecipeIndex];
  
  const handleChangeRecipe = (index) => {
    setActiveRecipeIndex(index);
    setShowTooltip(null);
  };

  return (
    <section className={styles.recipeComparison}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Zobacz różnicę</h2>
        <p className={styles.subheading}>
          Porównaj oryginalne przepisy z ich zdrowszymi wersjami. 
          Najedź kursorem na zmienione składniki, aby zobaczyć wyjaśnienie.
        </p>

        <div className={styles.recipeSelector}>
          {exampleRecipes.map((recipe, index) => (
            <button
              key={recipe.id}
              className={`${styles.recipeSelectorButton} ${activeRecipeIndex === index ? styles.active : ''}`}
              onClick={() => handleChangeRecipe(index)}
              aria-pressed={activeRecipeIndex === index}
            >
              {recipe.name}
            </button>
          ))}
        </div>
        
        <div className={styles.comparisonContainer}>
          <RecipeCard 
            title="Oryginalny przepis"
            recipeName={activeRecipe.name}
            ingredients={activeRecipe.original.ingredients}
            nutritionalValues={activeRecipe.original.nutrition}
            onIngredientHover={() => {}}
          />
          
          <ComparisonStats 
            carbsReduction={activeRecipe.carbsReduction}
            originalNutrition={activeRecipe.original.nutrition}
            modifiedNutrition={activeRecipe.modified.nutrition}
          />
          
          <RecipeCard 
            title="Zmodyfikowany przepis"
            recipeName={activeRecipe.modifiedName}
            ingredients={activeRecipe.modified.ingredients}
            nutritionalValues={activeRecipe.modified.nutrition}
            onIngredientHover={(index) => setShowTooltip(index)}
            activeTooltip={showTooltip}
          />
        </div>
      </div>
    </section>
  );
}; 