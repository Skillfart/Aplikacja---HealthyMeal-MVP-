import React from 'react';
import styles from './RecipeCard.module.css';
import { Tooltip } from './Tooltip';

export const RecipeCard = ({ 
  title, 
  recipeName, 
  ingredients, 
  nutritionalValues, 
  onIngredientHover,
  activeTooltip 
}) => {
  return (
    <div className={styles.recipeCard}>
      <h3 className={styles.cardTitle}>{title}</h3>
      <h4 className={styles.recipeName}>{recipeName}</h4>
      
      <div className={styles.ingredientsSection}>
        <h5 className={styles.sectionTitle}>Składniki:</h5>
        <ul className={styles.ingredientsList}>
          {ingredients.map((ingredient, index) => (
            <li 
              key={`${ingredient.name}-${index}`}
              className={`${styles.ingredient} ${ingredient.isModified ? styles.modified : ''}`}
              onMouseEnter={() => onIngredientHover(index)}
              onMouseLeave={() => onIngredientHover(null)}
            >
              <span className={styles.ingredientName}>{ingredient.name}</span>
              <span className={styles.ingredientAmount}>
                {ingredient.amount} {ingredient.unit}
              </span>
              {ingredient.isModified && ingredient.explanation && activeTooltip === index && (
                <Tooltip text={ingredient.explanation} />
              )}
            </li>
          ))}
        </ul>
      </div>
      
      <div className={styles.nutritionSection}>
        <h5 className={styles.sectionTitle}>Wartości odżywcze (na porcję):</h5>
        <div className={styles.nutritionGrid}>
          <div className={styles.nutritionItem}>
            <span className={styles.nutritionLabel}>Kalorie:</span>
            <span className={styles.nutritionValue}>{nutritionalValues.calories} kcal</span>
          </div>
          <div className={styles.nutritionItem}>
            <span className={styles.nutritionLabel}>Węglowodany:</span>
            <span className={styles.nutritionValue}>{nutritionalValues.carbs} g</span>
          </div>
          <div className={styles.nutritionItem}>
            <span className={styles.nutritionLabel}>Białko:</span>
            <span className={styles.nutritionValue}>{nutritionalValues.protein} g</span>
          </div>
          <div className={styles.nutritionItem}>
            <span className={styles.nutritionLabel}>Tłuszcz:</span>
            <span className={styles.nutritionValue}>{nutritionalValues.fat} g</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 