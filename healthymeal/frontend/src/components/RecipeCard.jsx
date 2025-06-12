import React from 'react';
import { Link } from 'react-router-dom';
import { useAI } from '../contexts/AIContext';

const RecipeCard = ({ recipe, onModify, onDelete }) => {
  const { usage } = useAI();
  const canUseAI = usage?.remaining > 0;

  if (!recipe) {
    return null;
  }

  const difficultyColor = {
    easy: 'text-green-600',
    medium: 'text-yellow-600',
    hard: 'text-red-600'
  };

  const difficultyText = {
    easy: 'Łatwy',
    medium: 'Średni',
    hard: 'Trudny'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {recipe?.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Czas przygotowania: {recipe?.preparationTime} min • 
              <span className={difficultyColor[recipe?.difficulty]}>
                {' '}{difficultyText[recipe?.difficulty]}
              </span>
            </p>
          </div>
          {recipe?.isModified && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Zmodyfikowany przez AI
            </span>
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Porcje: {recipe?.servings} • 
            Węglowodany: {recipe?.nutritionalValues?.carbsPerServing}g/porcję
          </p>
          {recipe?.tags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {recipe.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={`/recipes/${recipe._id}`}
            className="btn btn-secondary"
          >
            Zobacz szczegóły
          </Link>
          <Link
            to={`/recipes/${recipe._id}/edit`}
            className="btn btn-secondary"
          >
            Edytuj
          </Link>
          <button
            onClick={() => onModify?.(recipe._id)}
            disabled={!canUseAI}
            className={`btn ${canUseAI ? 'btn-primary' : 'btn-disabled'}`}
            title={!canUseAI ? 'Przekroczono dzienny limit użycia AI' : ''}
          >
            Modyfikuj z AI
          </button>
          <button
            onClick={() => onDelete?.(recipe._id)}
            className="btn btn-danger"
          >
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard; 