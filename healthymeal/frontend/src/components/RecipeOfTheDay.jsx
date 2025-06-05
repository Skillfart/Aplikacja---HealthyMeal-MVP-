import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Image,
  Badge,
  Button,
  VStack,
  HStack,
  useToast,
  Skeleton,
  Icon,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaStar, FaClock, FaUtensils, FaCarrot } from 'react-icons/fa';
import { useSupabase } from '../contexts/SupabaseContext';
import { usePreferences } from '../contexts/PreferencesContext';

export default function RecipeOfTheDay() {
  const { supabase } = useSupabase();
  const { preferences } = usePreferences();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchRecipeOfTheDay();
  }, []);

  const fetchRecipeOfTheDay = async () => {
    try {
      setLoading(true);
      
      // Pobierz dzisiejszą datę w formacie YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      
      // Sprawdź czy mamy już zapisany przepis dnia
      const { data: existingRecipe, error: existingError } = await supabase
        .from('recipe_of_the_day')
        .select('recipe_id')
        .eq('date', today)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError;
      }

      if (existingRecipe) {
        // Pobierz szczegóły istniejącego przepisu
        const { data: recipeData, error: recipeError } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', existingRecipe.recipe_id)
          .single();

        if (recipeError) throw recipeError;
        setRecipe(recipeData);
      } else {
        // Wybierz losowy przepis na dzisiaj
        const { data: randomRecipe, error: randomError } = await supabase
          .from('recipes')
          .select('*')
          .limit(1)
          .order('RANDOM()');

        if (randomError) throw randomError;

        if (randomRecipe?.[0]) {
          // Zapisz wybrany przepis jako przepis dnia
          const { error: saveError } = await supabase
            .from('recipe_of_the_day')
            .insert({
              date: today,
              recipe_id: randomRecipe[0].id
            });

          if (saveError) throw saveError;
          setRecipe(randomRecipe[0]);
        }
      }
    } catch (error) {
      toast({
        title: 'Błąd pobierania przepisu dnia',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        borderWidth={1}
        borderRadius="lg"
        overflow="hidden"
        bg="white"
        shadow="sm"
      >
        <Skeleton height="200px" />
        <Box p={6}>
          <Skeleton height="24px" width="70%" mb={4} />
          <Skeleton height="20px" width="40%" mb={2} />
          <Skeleton height="20px" width="60%" mb={4} />
          <Skeleton height="40px" width="100%" />
        </Box>
      </Box>
    );
  }

  if (!recipe) {
    return null;
  }

  const isLowCarb = recipe.nutritionalValues.carbs <= preferences.maxCarbs;

  return (
    <Box
      borderWidth={1}
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      shadow="sm"
    >
      <Box position="relative">
        <Image
          src={recipe.image || '/default-recipe-image.jpg'}
          alt={recipe.name}
          objectFit="cover"
          height="200px"
          width="100%"
        />
        <Box
          position="absolute"
          top={2}
          left={2}
          bg="yellow.400"
          color="gray.800"
          px={2}
          py={1}
          borderRadius="md"
          display="flex"
          alignItems="center"
        >
          <Icon as={FaStar} mr={1} />
          <Text fontWeight="bold">Przepis dnia</Text>
        </Box>
      </Box>

      <Box p={6}>
        <VStack align="stretch" spacing={4}>
          <Box>
            <Heading size="md" mb={2}>
              {recipe.name}
            </Heading>
            <Text noOfLines={2} color="gray.600">
              {recipe.description}
            </Text>
          </Box>

          <HStack spacing={4}>
            <HStack>
              <Icon as={FaClock} color="gray.500" />
              <Text fontSize="sm">{recipe.preparationTime} min</Text>
            </HStack>
            <HStack>
              <Icon as={FaUtensils} color="gray.500" />
              <Text fontSize="sm">{recipe.difficulty}</Text>
            </HStack>
            <HStack>
              <Icon as={FaCarrot} color="gray.500" />
              <Text fontSize="sm">
                {recipe.nutritionalValues.carbs}g węgl.
                {isLowCarb && (
                  <Badge ml={1} colorScheme="green">
                    W normie
                  </Badge>
                )}
              </Text>
            </HStack>
          </HStack>

          <HStack spacing={4}>
            <Button
              as={RouterLink}
              to={`/recipes/${recipe.id}`}
              colorScheme="blue"
              size="sm"
              flex={1}
            >
              Zobacz przepis
            </Button>
            <Button
              as={RouterLink}
              to={`/recipes/${recipe.id}/compare`}
              colorScheme="green"
              size="sm"
              flex={1}
            >
              Dostosuj do diety
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
} 