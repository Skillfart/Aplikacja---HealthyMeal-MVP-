import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RecipeCard.module.css';

const RecipeCard = ({ recipe, onDelete }) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate(`/dashboard/recipes/${recipe._id}`);
  }, [navigate, recipe._id]);

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    navigate(`/dashboard/recipes/edit/${recipe._id}`);
  }, [navigate, recipe._id]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(recipe._id);
    }
  }, [onDelete, recipe._id]);

  const handleCompare = (e) => {
    e.stopPropagation();
    navigate(`/dashboard/recipes/compare?recipeId=${recipe._id}`);
  };

  return (
    <div className={styles.recipeCard} onClick={handleClick}>
      {recipe.image ? (
        <img
          src={recipe.image}
          alt={recipe.title}
          className={styles.recipeImage}
        />
      ) : (
        <div className={styles.noImage}>
          <i className="fas fa-utensils"></i>
        </div>
      )}

      <div className={styles.recipeContent}>
        <h3 className={styles.recipeTitle}>{recipe.title}</h3>
        <div className={styles.recipeDetails}>
          <span>
            <i className="fas fa-clock"></i> {recipe.prepTime + recipe.cookTime}{" "}
            min
          </span>
          <span>
            <i className="fas fa-fire"></i> {recipe.calories} kcal
          </span>
        </div>
        <div className={styles.recipeActions}>
          <button
            onClick={handleEdit}
            className={`${styles.actionButton} ${styles.editButton}`}
          >
            <i className="fas fa-edit"></i> Edytuj
          </button>
          <button
            onClick={handleDelete}
            className={`${styles.actionButton} ${styles.deleteButton}`}
          >
            <i className="fas fa-trash"></i> Usuń
          </button>
          <button
            onClick={handleCompare}
            className={`${styles.actionButton} ${styles.compareButton}`}
          >
            <i className="fas fa-balance-scale"></i> Porównaj
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard; 