import React, { useState, useEffect } from 'react';
import { Box, Heading, List, ListItem, Text, Badge, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserPreferences } from '../../../services/userService';

/**
 * @typedef {Object} UserPreferences
 * @property {string} dietType - Typ diety użytkownika
 * @property {number} maxCarbs - Maksymalna ilość węglowodanów
 * @property {string[]} excludedProducts - Lista wykluczonych produktów
 * @property {string[]} allergens - Lista alergenów
 */

/**
 * Formatuje typ diety na przyjazną dla użytkownika nazwę
 * @param {string} dietType - Typ diety z preferencji użytkownika
 * @returns {string} Sformatowana nazwa diety
 */
const formatDietType = (dietType) => {
  const dietNames = {
    normal: 'STANDARDOWA',
    keto: 'KETOGENICZNA',
    lowCarb: 'NISKOWĘGLOWODANOWA',
    paleo: 'PALEO',
    vegetarian: 'WEGETARIAŃSKA',
    vegan: 'WEGAŃSKA'
  };
  return dietNames[dietType] || dietType.toUpperCase();
};

/**
 * Komponent wyświetlający preferencje użytkownika na dashboardzie
 * @returns {JSX.Element} Karta z preferencjami użytkownika
 */
const PreferencesCard = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    dietType: 'normal',
    maxCarbs: 0,
    excludedProducts: [],
    allergens: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserPreferences();
      setPreferences(data);
    } catch (err) {
      console.error('Błąd podczas ładowania preferencji:', err);
      setError('Nie udało się załadować preferencji. Spróbuj odświeżyć stronę.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  if (loading) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg">
        <Text>Ładowanie preferencji...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg">
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <Heading size="md" mb={4}>
        Twoje preferencje żywieniowe
      </Heading>
      <List spacing={3}>
        <ListItem>
          <Text fontWeight="bold">Typ diety:</Text>
          <Badge colorScheme="green">{formatDietType(preferences.dietType)}</Badge>
        </ListItem>
        <ListItem>
          <Text fontWeight="bold">Maksymalna ilość węglowodanów:</Text>
          <Text>{preferences.maxCarbs}g na posiłek</Text>
        </ListItem>
        {preferences.excludedProducts?.length > 0 && (
          <ListItem>
            <Text fontWeight="bold">Wykluczone produkty:</Text>
            <Text>{preferences.excludedProducts.join(', ')}</Text>
          </ListItem>
        )}
        {preferences.allergens?.length > 0 && (
          <ListItem>
            <Text fontWeight="bold">Alergeny:</Text>
            <Text>{preferences.allergens.join(', ')}</Text>
          </ListItem>
        )}
      </List>
      <Box mt={4}>
        <Link as={RouterLink} to="/profile/preferences" color="blue.500">
          Edytuj preferencje
        </Link>
      </Box>
    </Box>
  );
};

export default PreferencesCard; 