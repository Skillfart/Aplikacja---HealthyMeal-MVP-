import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useToast,
  Spinner,
  Icon,
  Select,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaPlus, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { useSupabase } from '../../contexts/SupabaseContext';
import { usePreferences } from '../../contexts/PreferencesContext';
import RecipeFilters from '../../components/Recipe/RecipeFilters';
import RecipeCard from '../../components/Recipe/RecipeCard';

export default function RecipeList() {
  const { supabase } = useSupabase();
  const { preferences } = usePreferences();
  const toast = useToast();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState({
    searchQuery: '',
    dietType: null,
    difficulty: null,
    carbsRange: { min: 0, max: 200 },
    timeRange: { min: 0, max: 180 },
    matchPreferences: false,
  });

  useEffect(() => {
    fetchRecipes();
  }, [sortBy, sortOrder, filters]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('recipes')
        .select('*');

      // Filtrowanie
      if (filters.searchQuery) {
        query = query.ilike('name', `%${filters.searchQuery}%`);
      }

      if (filters.dietType) {
        query = query.eq('dietType', filters.dietType);
      }

      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      query = query
        .gte('nutritionalValues->>carbs', filters.carbsRange.min)
        .lte('nutritionalValues->>carbs', filters.carbsRange.max)
        .gte('preparationTime', filters.timeRange.min)
        .lte('preparationTime', filters.timeRange.max);

      // Sortowanie
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;

      // Filtrowanie po preferencjach użytkownika
      let filteredData = data;
      if (filters.matchPreferences) {
        filteredData = data.filter(recipe => {
          // Sprawdź zgodność z typem diety
          if (preferences.dietType !== 'normal' && recipe.dietType !== preferences.dietType) {
            return false;
          }

          // Sprawdź limit węglowodanów
          if (recipe.nutritionalValues.carbs > preferences.maxCarbs) {
            return false;
          }

          // Sprawdź wykluczone produkty
          const hasExcludedProduct = recipe.ingredients.some(ingredient =>
            preferences.excludedProducts.includes(ingredient.name.toLowerCase())
          );
          if (hasExcludedProduct) {
            return false;
          }

          // Sprawdź alergeny
          const hasAllergen = recipe.allergens.some(allergen =>
            preferences.allergens.includes(allergen)
          );
          if (hasAllergen) {
            return false;
          }

          return true;
        });
      }

      setRecipes(filteredData);
    } catch (error) {
      toast({
        title: 'Błąd pobierania przepisów',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      dietType: null,
      difficulty: null,
      carbsRange: { min: 0, max: 200 },
      timeRange: { min: 0, max: 180 },
      matchPreferences: false,
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Heading>Przepisy</Heading>
            <Text color="gray.600">
              Znaleziono {recipes.length} przepisów
            </Text>
          </Box>
          <Button
            as={RouterLink}
            to="/recipes/new"
            colorScheme="blue"
            leftIcon={<Icon as={FaPlus} />}
          >
            Dodaj przepis
          </Button>
        </HStack>

        <RecipeFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={resetFilters}
        />

        <HStack>
          <Select
            value={sortBy}
            onChange={handleSortChange}
            w="200px"
          >
            <option value="name">Nazwa</option>
            <option value="preparationTime">Czas przygotowania</option>
            <option value="nutritionalValues->>carbs">Węglowodany</option>
            <option value="difficulty">Poziom trudności</option>
            <option value="created_at">Data dodania</option>
          </Select>
          <Button
            onClick={toggleSortOrder}
            variant="ghost"
            leftIcon={
              <Icon
                as={sortOrder === 'asc' ? FaSortAmountUp : FaSortAmountDown}
              />
            }
          >
            {sortOrder === 'asc' ? 'Rosnąco' : 'Malejąco'}
          </Button>
        </HStack>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <Spinner size="xl" />
          </Box>
        ) : recipes.length > 0 ? (
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
            spacing={6}
          >
            {recipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                preferences={preferences}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Box
            textAlign="center"
            py={8}
            px={4}
            borderWidth={1}
            borderRadius="lg"
          >
            <Text fontSize="lg" mb={4}>
              Nie znaleziono przepisów spełniających kryteria wyszukiwania
            </Text>
            <Button
              onClick={resetFilters}
              colorScheme="blue"
              variant="outline"
            >
              Resetuj filtry
            </Button>
          </Box>
        )}
      </VStack>
    </Container>
  );
} 