import React from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  SimpleGrid,
  Button,
  VStack,
  useBreakpointValue,
  Container,
  Icon,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaPlus, FaSearch, FaRandom } from 'react-icons/fa';
import RecipeOfTheDay from '../components/RecipeOfTheDay';
import AIUsageCounter from '../components/AIUsageCounter';
import { useSupabase } from '../contexts/SupabaseContext';
import { usePreferences } from '../contexts/PreferencesContext';

export default function Dashboard() {
  const { session } = useSupabase();
  const { preferences } = usePreferences();
  const columns = useBreakpointValue({ base: 1, md: 2 });

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading mb={2}>
            Witaj, {session?.user?.user_metadata?.name || 'Użytkowniku'}!
          </Heading>
          <Text color="gray.600">
            Twoja dieta: {preferences.dietType}, Max węglowodanów: {preferences.maxCarbs}g
          </Text>
        </Box>

        <SimpleGrid columns={columns} spacing={8}>
          {/* Lewa kolumna */}
          <VStack spacing={8} align="stretch">
            {/* Przepis dnia */}
            <Box>
              <Heading size="md" mb={4}>
                Przepis dnia
              </Heading>
              <RecipeOfTheDay />
            </Box>

            {/* Szybkie akcje */}
            <Box>
              <Heading size="md" mb={4}>
                Szybkie akcje
              </Heading>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                <Button
                  as={RouterLink}
                  to="/recipes/new"
                  leftIcon={<Icon as={FaPlus} />}
                  colorScheme="blue"
                  size="lg"
                  height="100px"
                >
                  Dodaj nowy przepis
                </Button>
                <Button
                  as={RouterLink}
                  to="/recipes"
                  leftIcon={<Icon as={FaSearch} />}
                  colorScheme="teal"
                  size="lg"
                  height="100px"
                >
                  Przeglądaj przepisy
                </Button>
              </SimpleGrid>
            </Box>
          </VStack>

          {/* Prawa kolumna */}
          <VStack spacing={8} align="stretch">
            {/* Licznik AI */}
            <Box>
              <Heading size="md" mb={4}>
                Wykorzystanie AI
              </Heading>
              <AIUsageCounter
                dailyUsage={2}
                hourlyUsage={1}
                minuteUsage={0}
              />
            </Box>

            {/* Twoje preferencje */}
            <Box
              borderWidth={1}
              borderRadius="lg"
              p={6}
              bg="white"
              shadow="sm"
            >
              <Heading size="md" mb={4}>
                Twoje preferencje żywieniowe
              </Heading>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold">Typ diety:</Text>
                  <Text>{preferences.dietType}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Maksymalna ilość węglowodanów:</Text>
                  <Text>{preferences.maxCarbs}g dziennie</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Wykluczone produkty:</Text>
                  <Text>
                    {preferences.excludedProducts.length > 0
                      ? preferences.excludedProducts.join(', ')
                      : 'Brak'}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Alergeny:</Text>
                  <Text>
                    {preferences.allergens.length > 0
                      ? preferences.allergens.join(', ')
                      : 'Brak'}
                  </Text>
                </Box>
                <Button
                  as={RouterLink}
                  to="/profile"
                  colorScheme="gray"
                  size="sm"
                >
                  Edytuj preferencje
                </Button>
              </VStack>
            </Box>
          </VStack>
        </SimpleGrid>
      </VStack>
    </Container>
  );
} 