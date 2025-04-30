import React from 'react';
import styles from './ComparisonStats.module.css';

export const ComparisonStats = ({ 
  carbsReduction, 
  originalNutrition, 
  modifiedNutrition 
}) => {
  // Oblicz procentowe różnice dla wszystkich wartości odżywczych
  const calculatePercentChange = (original, modified) => {
    return Math.round(((modified - original) / original) * 100);
  };

  const caloriesChange = calculatePercentChange(
    originalNutrition.calories, 
    modifiedNutrition.calories
  );
  
  const proteinChange = calculatePercentChange(
    originalNutrition.protein, 
    modifiedNutrition.protein
  );
  
  const fatChange = calculatePercentChange(
    originalNutrition.fat, 
    modifiedNutrition.fat
  );

  return (
    <div className={styles.comparisonStats}>
      <div className={styles.mainStat}>
        <span className={styles.statValue}>-{carbsReduction}%</span>
        <span className={styles.statLabel}>węglowodanów</span>
      </div>
      
      <div className={styles.otherStats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Kalorie:</span>
          <span className={`${styles.statChange} ${caloriesChange <= 0 ? styles.positive : styles.negative}`}>
            {caloriesChange > 0 ? '+' : ''}{caloriesChange}%
          </span>
        </div>
        
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Białko:</span>
          <span className={`${styles.statChange} ${proteinChange >= 0 ? styles.positive : styles.negative}`}>
            {proteinChange > 0 ? '+' : ''}{proteinChange}%
          </span>
        </div>
        
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Tłuszcz:</span>
          <span className={`${styles.statChange} ${fatChange <= 30 ? styles.neutral : styles.negative}`}>
            {fatChange > 0 ? '+' : ''}{fatChange}%
          </span>
        </div>
      </div>
    </div>
  );
}; 