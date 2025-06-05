import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Text,
  VStack,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  List,
  ListItem,
  IconButton
} from '@chakra-ui/react';
import { FaEdit, FaTrash, FaMagic, FaPrint } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getRecipeById, deleteRecipe } from '../../services/recipeService';
import { CircularProgress, Typography } from '@mui/material';

/**
 * @typedef {import('../../types').Recipe} Recipe
 */

/**
 * Komponent wyświetlający szczegóły przepisu
 * @returns {JSX.Element} Widok szczegółów przepisu
 */
const Recipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  
  /** @type {[Recipe|null, Function]} */
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const data = await getRecipeById(id);
        setRecipe(data);
      } catch (error) {
        setError('Nie udało się załadować przepisu');
        navigate('/recipes');
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [id, navigate]);

  /**
   * Obsługa usuwania przepisu
   * @returns {Promise<void>} Promise rozwiązywany po usunięciu przepisu
   */
  const handleDelete = async () => {
    try {
      await deleteRecipe(id);
      toast({
        title: 'Sukces',
        description: 'Przepis został usunięty',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      navigate('/recipes');
    } catch (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się usunąć przepisu',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  /**
   * Obsługa modyfikacji przepisu przez AI
   * @returns {void}
   */
  const handleModify = () => {
    navigate(`/recipes/${id}/modify`);
  };

  /**
   * Obsługa edycji przepisu
   * @returns {void}
   */
  const handleEdit = () => {
    navigate(`/recipes/${id}/edit`);
  };

  /**
   * Obsługa drukowania przepisu
   * @returns {void}
   */
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!recipe) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Przepis nie został znaleziony</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          {recipe?.title || 'Przepis'}
        </Typography>
        
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" align="center">
            <Heading as="h1" size="xl">{recipe.title}</Heading>
            <HStack spacing={2}>
              <IconButton
                icon={<FaEdit />}
                aria-label="Edytuj przepis"
                onClick={handleEdit}
              />
              <IconButton
                icon={<FaMagic />}
                aria-label="Modyfikuj przez AI"
                onClick={handleModify}
              />
              <IconButton
                icon={<FaPrint />}
                aria-label="Drukuj przepis"
                onClick={handlePrint}
              />
              <IconButton
                icon={<FaTrash />}
                aria-label="Usuń przepis"
                onClick={handleDelete}
                colorScheme="red"
              />
            </HStack>
          </HStack>

          <HStack spacing={4}>
            <Badge>{recipe.difficulty}</Badge>
            <Text>Czas przygotowania: {recipe.preparationTime} min</Text>
            <Text>Porcje: {recipe.servings}</Text>
          </HStack>

          <Tabs>
            <TabList>
              <Tab>Składniki</Tab>
              <Tab>Przygotowanie</Tab>
              <Tab>Wartości odżywcze</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <List spacing={2}>
                  {recipe.ingredients.map((ingredient, index) => (
                    <ListItem key={index}>
                      {ingredient.quantity} {ingredient.unit} {ingredient.name}
                    </ListItem>
                  ))}
                </List>
              </TabPanel>

              <TabPanel>
                <List spacing={4}>
                  {recipe.steps.map((step, index) => (
                    <ListItem key={index}>
                      <Text as="span" fontWeight="bold">{index + 1}.</Text> {step}
                    </ListItem>
                  ))}
                </List>
              </TabPanel>

              <TabPanel>
                <VStack align="stretch" spacing={2}>
                  <Text>Kalorie na porcję: {recipe.nutritionalValues.caloriesPerServing} kcal</Text>
                  <Text>Węglowodany na porcję: {recipe.nutritionalValues.carbsPerServing}g</Text>
                  <Text>Białko na porcję: {recipe.nutritionalValues.proteinPerServing}g</Text>
                  <Text>Tłuszcze na porcję: {recipe.nutritionalValues.fatPerServing}g</Text>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>

          <Box>
            <Text fontWeight="bold">Tagi:</Text>
            <HStack spacing={2} mt={2}>
              {recipe.tags.map((tag, index) => (
                <Badge key={index}>{tag}</Badge>
              ))}
            </HStack>
          </Box>
        </VStack>
      </Box>
    </Container>
  );
};

export default Recipe; 