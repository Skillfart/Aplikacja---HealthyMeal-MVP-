import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  List,
  ListItem,
  Badge,
  VStack,
  HStack,
  Button,
  useToast,
  Spinner,
  Divider,
  Tooltip
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupabase } from '../../contexts/SupabaseContext';
import { usePreferences } from '../../contexts/PreferencesContext';
import { FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';

export default function RecipeComparison() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { supabase } = useSupabase();
  const { preferences } = usePreferences();
  const toast = useToast();

  const [originalRecipe, setOriginalRecipe] = useState(null);
  const [modifiedRecipe, setModifiedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, [id]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      
      // Pobierz oryginalny przepis
      const { data: original, error: originalError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (originalError) throw originalError;

      // Pobierz zmodyfikowaną wersję
      const { data: modified, error: modifiedError } = await supabase
        .from('modified_recipes')
        .select('*')
        .eq('original_recipe_id', id)
        .eq('user_preferences', JSON.stringify(preferences))
        .single();

      if (modifiedError && modifiedError.code !== 'PGRST116') throw modifiedError;

      setOriginalRecipe(original);
      setModifiedRecipe(modified);
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

  const handleModifyRecipe = async () => {
    try {
      setSaving(true);
      
      // Wywołaj API do modyfikacji przepisu
      const response = await fetch('/api/recipes/modify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: id,
          preferences,
        }),
      });

      if (!response.ok) throw new Error('Błąd modyfikacji przepisu');

      const modifiedRecipe = await response.json();
      setModifiedRecipe(modifiedRecipe);

      toast({
        title: 'Przepis zmodyfikowany',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Błąd modyfikacji przepisu',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveModified = async () => {
    try {
      setSaving(true);
      
      // Zapisz zmodyfikowaną wersję
      const { error } = await supabase
        .from('modified_recipes')
        .upsert({
          original_recipe_id: id,
          user_preferences: preferences,
          ...modifiedRecipe,
        });

      if (error) throw error;

      toast({
        title: 'Przepis zapisany',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate(`/recipes/${id}`);
    } catch (error) {
      toast({
        title: 'Błąd zapisywania przepisu',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Porównanie przepisów</Heading>
          <HStack>
            {!modifiedRecipe && (
              <Button
                colorScheme="blue"
                onClick={handleModifyRecipe}
                isLoading={saving}
              >
                Modyfikuj przepis
              </Button>
            )}
            {modifiedRecipe && (
              <Button
                colorScheme="green"
                onClick={handleSaveModified}
                isLoading={saving}
              >
                Zapisz zmodyfikowany
              </Button>
            )}
          </HStack>
        </HStack>

        <Grid templateColumns="repeat(2, 1fr)" gap={8}>
          {/* Oryginalny przepis */}
          <Box borderWidth={1} borderRadius="lg" p={4}>
            <Heading size="md" mb={4}>
              Oryginalny przepis
            </Heading>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Heading size="sm" mb={2}>
                  Składniki:
                </Heading>
                <List spacing={2}>
                  {originalRecipe.ingredients.map((ingredient, index) => (
                    <ListItem key={index}>
                      {ingredient.quantity} {ingredient.unit} {ingredient.name}
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Box>
                <Heading size="sm" mb={2}>
                  Przygotowanie:
                </Heading>
                <List spacing={2}>
                  {originalRecipe.steps.map((step, index) => (
                    <ListItem key={index}>
                      {index + 1}. {step}
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Box>
                <Heading size="sm" mb={2}>
                  Wartości odżywcze:
                </Heading>
                <Text>Węglowodany: {originalRecipe.nutritionalValues.carbs}g</Text>
              </Box>
            </VStack>
          </Box>

          {/* Zmodyfikowany przepis */}
          <Box borderWidth={1} borderRadius="lg" p={4}>
            {modifiedRecipe ? (
              <VStack align="stretch" spacing={4}>
                <Heading size="md" mb={4}>
                  Zmodyfikowany przepis
                  <Badge ml={2} colorScheme="green">
                    Dostosowany do preferencji
                  </Badge>
                </Heading>
                <Box>
                  <Heading size="sm" mb={2}>
                    Składniki:
                  </Heading>
                  <List spacing={2}>
                    {modifiedRecipe.ingredients.map((ingredient, index) => (
                      <ListItem key={index}>
                        <HStack>
                          <Text>
                            {ingredient.quantity} {ingredient.unit} {ingredient.name}
                          </Text>
                          {ingredient.isModified && (
                            <Tooltip label={ingredient.substitutionReason}>
                              <Box color="blue.500">
                                <FaInfoCircle />
                              </Box>
                            </Tooltip>
                          )}
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                </Box>
                <Box>
                  <Heading size="sm" mb={2}>
                    Przygotowanie:
                  </Heading>
                  <List spacing={2}>
                    {modifiedRecipe.steps.map((step, index) => (
                      <ListItem key={index}>
                        <HStack>
                          <Text>{index + 1}. {step.description}</Text>
                          {step.isModified && (
                            <Tooltip label={step.modificationReason}>
                              <Box color="blue.500">
                                <FaInfoCircle />
                              </Box>
                            </Tooltip>
                          )}
                        </HStack>
                      </ListItem>
                    ))}
                  </List>
                </Box>
                <Box>
                  <Heading size="sm" mb={2}>
                    Wartości odżywcze:
                  </Heading>
                  <Text>
                    Węglowodany: {modifiedRecipe.nutritionalValues.totalCarbs}g
                    {' '}
                    <Badge colorScheme="green">
                      -{modifiedRecipe.nutritionalValues.carbsReduction}g
                    </Badge>
                  </Text>
                </Box>
                <Divider />
                <Box>
                  <Heading size="sm" mb={2}>
                    Wprowadzone zmiany:
                  </Heading>
                  <Text>{modifiedRecipe.changesDescription}</Text>
                </Box>
              </VStack>
            ) : (
              <VStack justify="center" minH="400px">
                <Text>Kliknij "Modyfikuj przepis", aby dostosować go do swoich preferencji</Text>
              </VStack>
            )}
          </Box>
        </Grid>
      </VStack>
    </Box>
  );
} 