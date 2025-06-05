import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardHeader,
  CardBody,
  Button,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  useToast
} from '@chakra-ui/react';
import { FaUtensils, FaHeart, FaHistory, FaStar } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getPreferences } from '../../services/preferencesService';

const StatCard = ({ title, value, icon, description }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="lg">
      <CardHeader>
        <Flex alignItems="center" justifyContent="space-between">
          <Text fontSize="lg" fontWeight="medium">{title}</Text>
          {icon}
        </Flex>
      </CardHeader>
      <CardBody>
        <Stat>
          <StatNumber fontSize="2xl">{value}</StatNumber>
          {description && <StatHelpText>{description}</StatHelpText>}
        </Stat>
      </CardBody>
    </Card>
  );
};

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRecipes: 0,
    favoriteRecipes: 0,
    recentRecipes: 0,
    rating: 0
  });

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/login');
      return;
    }

    const loadDashboardData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const preferences = await getPreferences();
        setStats(preferences.stats);
      } catch (error) {
        console.error('Błąd podczas ładowania danych:', error);
        setError('Nie udało się załadować danych dashboardu');
        toast({
          title: 'Błąd',
          description: 'Nie udało się załadować danych dashboardu',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated, navigate, toast]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Witaj, {user?.email}!
          </Heading>
          <Text color="gray.600">
            Oto podsumowanie Twojej aktywności w HealthyMeal
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <StatCard
            title="Wszystkie przepisy"
            value={stats.totalRecipes}
            icon={<FaUtensils size="24px" color="#4299E1" />}
            description="Łączna liczba przepisów"
          />
          <StatCard
            title="Ulubione"
            value={stats.favoriteRecipes}
            icon={<FaHeart size="24px" color="#E53E3E" />}
            description="Zapisane ulubione przepisy"
          />
          <StatCard
            title="Ostatnio dodane"
            value={stats.recentRecipes}
            icon={<FaHistory size="24px" color="#38A169" />}
            description="W ostatnim tygodniu"
          />
          <StatCard
            title="Średnia ocena"
            value={stats.rating.toFixed(1)}
            icon={<FaStar size="24px" color="#ECC94B" />}
            description="Ocena Twoich przepisów"
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Card>
            <CardHeader>
              <Heading size="md">Polecane przepisy</Heading>
            </CardHeader>
            <CardBody>
              <Text>Wkrótce dostępne...</Text>
              <Button colorScheme="blue" mt={4} onClick={() => navigate('/recipes')}>
                Przeglądaj przepisy
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading size="md">Twoje ostatnie aktywności</Heading>
            </CardHeader>
            <CardBody>
              <Text>Wkrótce dostępne...</Text>
              <Button colorScheme="blue" mt={4} onClick={() => navigate('/profile')}>
                Zobacz profil
              </Button>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default Dashboard; 