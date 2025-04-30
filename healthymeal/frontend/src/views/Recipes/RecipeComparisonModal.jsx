import React from 'react';
import styles from './RecipeComparisonModal.module.css';
// Będziemy używać Unicode zamiast react-icons/fa tymczasowo
// import { FaArrowRight, FaTimes, FaCheck, FaPlus, FaMinus, FaExchangeAlt } from 'react-icons/fa';

export const RecipeComparisonModal = ({ isOpen, onClose, originalRecipe, modifiedRecipe, onSave }) => {
  if (!isOpen || !originalRecipe || !modifiedRecipe) return null;

  // Funkcja porównująca składniki
  const compareIngredients = () => {
    if (!originalRecipe?.ingredients || !modifiedRecipe?.ingredients) {
      return [];
    }
    
    // Dodajmy logowanie do sprawdzenia struktury danych
    console.log('Original ingredients structure:', JSON.stringify(originalRecipe.ingredients, null, 2));
    console.log('Modified ingredients structure:', JSON.stringify(modifiedRecipe.ingredients, null, 2));
    
    const originalIngredientsMap = new Map(
      originalRecipe.ingredients.map(ing => [
        (ing.ingredient?.name || ing.name || '').toLowerCase(), 
        ing
      ])
    );
    
    const modifiedIngredientsMap = new Map(
      modifiedRecipe.ingredients.map(ing => [
        (ing.ingredient?.name || ing.name || '').toLowerCase(), 
        ing
      ])
    );
    
    const results = [];
    
    // Sprawdź składniki, które zostały zmodyfikowane lub są w obu przepisach
    originalRecipe.ingredients.forEach(originalIng => {
      const name = (originalIng.ingredient?.name || originalIng.name || '').toLowerCase();
      if (modifiedIngredientsMap.has(name)) {
        const modifiedIng = modifiedIngredientsMap.get(name);
        
        // Sprawdź czy ilość lub jednostka się zmieniły
        if (originalIng.quantity !== modifiedIng.quantity || originalIng.unit !== modifiedIng.unit) {
          results.push({
            name: originalIng.ingredient?.name || originalIng.name || '',
            status: 'modified',
            original: originalIng,
            modified: modifiedIng
          });
        } else {
          results.push({
            name: originalIng.ingredient?.name || originalIng.name || '',
            status: 'unchanged',
            original: originalIng,
            modified: modifiedIng
          });
        }
      } else {
        // Składnik został usunięty
        results.push({
          name: originalIng.ingredient?.name || originalIng.name || '',
          status: 'removed',
          original: originalIng,
          modified: null
        });
      }
    });
    
    // Sprawdź składniki, które zostały dodane
    modifiedRecipe.ingredients.forEach(modifiedIng => {
      const name = (modifiedIng.ingredient?.name || modifiedIng.name || '').toLowerCase();
      if (!originalIngredientsMap.has(name)) {
        results.push({
          name: modifiedIng.ingredient?.name || modifiedIng.name || '',
          status: 'added',
          original: null,
          modified: modifiedIng
        });
      }
    });
    
    // Sortuj wyniki: najpierw zmodyfikowane, potem dodane, potem usunięte, potem niezmienione
    return results.sort((a, b) => {
      const statusOrder = { modified: 1, added: 2, removed: 3, unchanged: 4 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  };

  // Funkcja porównująca kroki przygotowania
  const compareSteps = () => {
    if (!originalRecipe?.steps || !modifiedRecipe?.steps) {
      return [];
    }
    
    const originalSteps = originalRecipe.steps || [];
    const modifiedSteps = modifiedRecipe.steps || [];
    const maxLength = Math.max(originalSteps.length, modifiedSteps.length);
    
    const results = [];
    
    for (let i = 0; i < maxLength; i++) {
      const originalStep = i < originalSteps.length ? originalSteps[i] : null;
      const modifiedStep = i < modifiedSteps.length ? modifiedSteps[i] : null;
      
      let status = 'unchanged';
      
      if (originalStep && modifiedStep) {
        if (originalStep.description !== modifiedStep.description) {
          status = 'modified';
        }
      } else if (originalStep) {
        status = 'removed';
      } else {
        status = 'added';
      }
      
      results.push({
        index: i,
        status,
        original: originalStep,
        modified: modifiedStep
      });
    }
    
    return results;
  };

  // Funkcja porównująca wartości odżywcze
  const compareNutrition = () => {
    if (!originalRecipe || !modifiedRecipe) {
      return [];
    }
    
    console.log('compareNutrition called');
    console.log('Original recipe:', originalRecipe);
    console.log('Modified recipe:', modifiedRecipe);
    
    // Mapowanie kluczy z backend do nazw użytkownika - zgodne z modelem Recipe
    const nutritionMapping = {
      totalCalories: 'calories',
      totalCarbs: 'węglowodany',
      carbsPerServing: 'węglowodany / porcja',
      totalProtein: 'białko',
      totalFat: 'tłuszcz',
      totalFiber: 'błonnik'
    };
    
    const nutritionUnits = {
      totalCalories: 'kcal',
      totalCarbs: 'g',
      carbsPerServing: 'g',
      totalProtein: 'g',
      totalFat: 'g',
      totalFiber: 'g'
    };
    
    const originalNutrition = originalRecipe.nutritionalValues || {};
    const modifiedNutrition = modifiedRecipe.nutritionalValues || {};
    
    console.log('Original nutritional values:', originalNutrition);
    console.log('Modified nutritional values:', modifiedNutrition);
    
    // Używamy kluczy z mapowania
    const nutritionKeys = Object.keys(nutritionMapping);
    
    const results = nutritionKeys.map(key => {
      const originalValue = originalNutrition[key] || 0;
      const modifiedValue = modifiedNutrition[key] || 0;
      
      console.log(`Key: ${key}, Original: ${originalValue}, Modified: ${modifiedValue}`);
      
      let diffPercentage = 0;
      if (originalValue > 0) {
        diffPercentage = ((modifiedValue - originalValue) / originalValue) * 100;
      }
      
      // Określamy czy zmiana jest dobra czy zła
      let changeQuality = '';
      
      if (Math.abs(diffPercentage) > 1) {  // Tylko jeśli zmiana jest większa niż 1%
        if (key === 'totalProtein' || key === 'totalFiber') {
          changeQuality = diffPercentage > 0 ? 'good' : 'bad';
        } else if (key === 'totalCalories' || key === 'totalCarbs' || key === 'carbsPerServing' || key === 'totalFat') {
          changeQuality = diffPercentage < 0 ? 'good' : 'bad';
        }
      }
      
      return {
        name: nutritionMapping[key],
        key,
        original: originalValue,
        modified: modifiedValue,
        diffPercentage,
        changeQuality,
        unit: nutritionUnits[key] || 'g'
      };
    });
    
    console.log('Nutrition comparison results:', results);
    return results;
  };

  const ingredientComparison = compareIngredients();
  const stepsComparison = compareSteps();
  const nutritionComparison = compareNutrition();

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Porównanie przepisów</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕ {/* Używamy Unicode zamiast FaTimes */}
          </button>
        </div>
        
        <div className={styles.modalBody}>
          {/* Sekcja tytułów */}
          <div className={styles.titleComparison}>
            <div className={styles.originalColumn}>
              <h3>{originalRecipe?.title || 'Przepis oryginalny'}</h3>
              <p>{originalRecipe?.description || ''}</p>
            </div>
            
            <div className={styles.modifiedColumn}>
              <h3>{modifiedRecipe?.title || 'Przepis zmodyfikowany'}</h3>
              <p>{modifiedRecipe?.description || ''}</p>
            </div>
          </div>
          
          {/* Wartości odżywcze */}
          <div className={styles.comparisonSection}>
            <h4>Wartości odżywcze</h4>
            <div className={styles.nutritionComparison}>
              {nutritionComparison.length > 0 ? (
                nutritionComparison.map((item) => (
                  <div className={styles.nutritionItem} key={item.key}>
                    <span className={styles.nutritionName}>{item.name[0].toUpperCase() + item.name.slice(1)}</span>
                    <div className={styles.nutritionValues}>
                      <span className={styles.nutritionOriginal}>
                        {item.original} {item.unit}
                      </span>
                      <span className={styles.nutritionArrow}>→</span>
                      <span className={`${styles.nutritionModified} ${
                        item.changeQuality === 'good' ? styles.nutritionGood :
                        item.changeQuality === 'bad' ? styles.nutritionBad : ''
                      }`}>
                        {item.modified} {item.unit}
                        {Math.abs(item.diffPercentage) > 1 && (
                          <span className={styles.diffPercentage}>
                            ({item.diffPercentage > 0 ? '+' : ''}{Math.round(item.diffPercentage)}%)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noNutrition}>
                  <p>Brak wartości odżywczych do porównania.</p>
                  <p>Wartości odżywcze można dodać podczas edycji przepisu.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Składniki */}
          <div className={styles.comparisonSection}>
            <h4>Składniki</h4>
            <div className={styles.ingredientsComparison}>
              <div className={styles.ingredientHeader}>
                <div className={styles.originalColumnHeader}>Oryginalny przepis (ilość, jednostka)</div>
                <div className={styles.statusColumnHeader}></div>
                <div className={styles.modifiedColumnHeader}>Zmodyfikowany przepis (ilość, jednostka)</div>
              </div>
              
              {ingredientComparison.map((item, index) => (
                <div 
                  key={index} 
                  className={`${styles.ingredientItem} ${styles[`ingredient${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`]}`}
                >
                  <div className={styles.ingredientName}>{item.name}</div>
                  <div className={styles.ingredientColumns}>
                    <div className={styles.originalColumn}>
                      {item.original && (
                        <span>
                          {item.original.quantity !== undefined ? item.original.quantity : 0} 
                          {item.original.unit ? ` ${item.original.unit}` : ''}
                        </span>
                      )}
                    </div>
                    
                    <div className={styles.statusColumn}>
                      {item.status === 'unchanged' && <span className={styles.unchangedIcon}>•</span>}
                      {item.status === 'modified' && <span className={styles.modifiedIcon}>↔</span>}
                      {item.status === 'added' && <span className={styles.addedIcon}>+</span>}
                      {item.status === 'removed' && <span className={styles.removedIcon}>-</span>}
                    </div>
                    
                    <div className={styles.modifiedColumn}>
                      {item.modified && (
                        <span>
                          {item.modified.quantity !== undefined ? item.modified.quantity : 0} 
                          {item.modified.unit ? ` ${item.modified.unit}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {item.modified && item.modified.substitutionReason && (
                    <div className={styles.substitutionReason}>
                      Powód zmiany: {item.modified.substitutionReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Kroki przygotowania */}
          <div className={styles.comparisonSection}>
            <h4>Kroki przygotowania</h4>
            <div className={styles.stepsComparison}>
              <div className={styles.stepsHeader}>
                <div className={styles.originalColumnHeader}>Oryginalny przepis</div>
                <div className={styles.statusColumnHeader}></div>
                <div className={styles.modifiedColumnHeader}>Zmodyfikowany przepis</div>
              </div>
              
              {stepsComparison.length > 0 ? (
                stepsComparison.map((item) => (
                  <div 
                    key={item.index} 
                    className={`${styles.stepItem} ${styles[`step${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`]}`}
                  >
                    <div className={styles.stepColumns}>
                      <div className={styles.originalColumn}>
                        {item.original && (
                          <div className={styles.stepContent}>
                            <span className={styles.stepNumber}>{item.original.number || (item.index + 1)}.</span>
                            <span className={styles.stepDescription}>{item.original.description || ''}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.statusColumn}>
                        {item.status === 'unchanged' && <span className={styles.unchangedIcon}>•</span>}
                        {item.status === 'modified' && <span className={styles.modifiedIcon}>↔</span>}
                        {item.status === 'added' && <span className={styles.addedIcon}>+</span>}
                        {item.status === 'removed' && <span className={styles.removedIcon}>-</span>}
                      </div>
                      
                      <div className={styles.modifiedColumn}>
                        {item.modified && (
                          <div className={styles.stepContent}>
                            <span className={styles.stepNumber}>{item.modified.number || (item.index + 1)}.</span>
                            <span className={styles.stepDescription}>{item.modified.description || ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {item.modified && item.modified.modificationReason && (
                      <div className={styles.modificationReason}>
                        Powód zmiany: {item.modified.modificationReason}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className={styles.noSteps}>
                  <p>Brak kroków przygotowania do porównania.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Podsumowanie zmian */}
          <div className={styles.comparisonSection}>
            <h4>Podsumowanie zmian</h4>
            <div className={styles.summaryContainer}>
              <p>{modifiedRecipe?.changesDescription || 'Przepis został zmodyfikowany.'}</p>
              
              <div className={styles.summaryStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Zmodyfikowane składniki:</span>
                  <span className={styles.statValue}>
                    {ingredientComparison?.filter(i => i.status === 'modified')?.length || 0}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Dodane składniki:</span>
                  <span className={styles.statValue}>
                    {ingredientComparison?.filter(i => i.status === 'added')?.length || 0}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Usunięte składniki:</span>
                  <span className={styles.statValue}>
                    {ingredientComparison?.filter(i => i.status === 'removed')?.length || 0}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Zmienione kroki:</span>
                  <span className={styles.statValue}>
                    {stepsComparison?.filter(s => s.status !== 'unchanged')?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.closeButton} onClick={onClose}>
            Zamknij
          </button>
          {onSave && (
            <button className={styles.saveButton} onClick={onSave}>
              Zapisz zmodyfikowany przepis
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 