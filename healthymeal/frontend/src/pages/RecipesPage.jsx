import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import RecipeList from '../components/RecipeList';
import NewRecipeForm from '../components/NewRecipeForm';
import RecipeDetails from './RecipeDetails';

const RecipesPage = () => {
  const location = useLocation();
  const { id } = useParams();
  const isNewRecipe = location.pathname === '/recipes/new';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nagłówek */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {isNewRecipe ? 'Nowy przepis' : id ? 'Szczegóły przepisu' : 'Twoje przepisy'}
          </h1>
          {!isNewRecipe && !id && (
            <Link
              to="/recipes/new"
              className="btn btn-primary"
            >
              Dodaj przepis
            </Link>
          )}
        </div>
      </header>

      {/* Zawartość */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {isNewRecipe ? (
          <NewRecipeForm />
        ) : id ? (
          <RecipeDetails />
        ) : (
          <RecipeList />
        )}
      </main>
    </div>
  );
};

export default RecipesPage; 