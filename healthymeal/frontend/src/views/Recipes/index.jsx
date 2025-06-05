import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Heading,
  HStack,
  Input,
  Select,
  VStack,
  useToast
} from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import RecipeCard from '../../components/Recipe/RecipeCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAllRecipes } from '../../services/recipeService';

/**
 * @typedef {import('../../types').Recipe} Recipe
 */

/**
 * Komponent listy przepisów
 * @returns {JSX.Element} Lista przepisów z filtrowaniem
 */
const Recipes = () => {
  /** @type {[Array<Recipe>, Function]} */
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [maxTime, setMaxTime] = useState('');
  
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const data = await getAllRecipes();
        setRecipes(data);
      } catch (error) {
        toast({
          title: 'Błąd',
          description: 'Nie udało się załadować przepisów',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, [toast]);

  /**
   * Filtrowanie przepisów na podstawie kryteriów
   * @returns {Array<Recipe>} Przefiltrowane przepisy
   */
  const getFilteredRecipes = () => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = !difficulty || recipe.difficulty === difficulty;
      const matchesTime = !maxTime || recipe.preparationTime <= parseInt(maxTime);
      
      return matchesSearch && matchesDifficulty && matchesTime;
    });
  };

  /**
   * Obsługa przejścia do dodawania nowego przepisu
   */
  const handleAddRecipe = () => {
    navigate('/recipes/new');
  };

  /**
   * Obsługa przejścia do szczegółów przepisu
   * @param {string} id - ID przepisu
   */
  const handleRecipeClick = (id) => {
    navigate(`/recipes/${id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const filteredRecipes = getFilteredRecipes();

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Heading>Moje przepisy</Heading>
          <Button
            leftIcon={<FaPlus />}
            colorScheme="blue"
            onClick={handleAddRecipe}
          >
            Dodaj przepis
          </Button>
        </HStack>

        <Box>
          <Grid templateColumns="repeat(3, 1fr)" gap={4}>
            <Input
              placeholder="Szukaj przepisu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              placeholder="Poziom trudności"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Łatwy</option>
              <option value="medium">Średni</option>
              <option value="hard">Trudny</option>
            </Select>
            <Select
              placeholder="Maksymalny czas"
              value={maxTime}
              onChange={(e) => setMaxTime(e.target.value)}
            >
              <option value="15">15 minut</option>
              <option value="30">30 minut</option>
              <option value="60">1 godzina</option>
              <option value="120">2 godziny</option>
            </Select>
          </Grid>
        </Box>

        <Grid
          templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
          gap={6}
        >
          {filteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => handleRecipeClick(recipe.id)}
            />
          ))}
        </Grid>
      </VStack>
    </Container>
  );
};

export default Recipes; 