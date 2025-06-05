import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
  VStack,
  Grid,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { FaUtensils, FaHeart, FaBrain, FaUserFriends } from 'react-icons/fa';
import LoginModal from '../../components/LoginModal';

/**
 * @typedef {Object} FeatureProps
 * @property {React.ElementType} icon - Ikona funkcji
 * @property {string} title - Tytuł funkcji
 * @property {string} description - Opis funkcji
 */

/**
 * Komponent pojedynczej funkcji
 * @param {FeatureProps} props - Właściwości komponentu
 * @returns {JSX.Element} Karta funkcji
 */
const Feature = ({ icon, title, description }) => {
  return (
    <VStack
      p={5}
      bg={useColorModeValue('white', 'gray.800')}
      rounded="xl"
      shadow="md"
      spacing={4}
      align="center"
      textAlign="center"
    >
      <Icon as={icon} w={10} h={10} color="blue.500" />
      <Text fontWeight="bold" fontSize="lg">{title}</Text>
      <Text color={useColorModeValue('gray.600', 'gray.400')}>{description}</Text>
    </VStack>
  );
};

/**
 * Komponent strony głównej
 * @returns {JSX.Element} Strona główna
 */
const LandingPage = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleOpenLoginModal = () => setIsLoginModalOpen(true);
  const handleCloseLoginModal = () => setIsLoginModalOpen(false);

  return (
    <Box>
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
      
      {/* Hero Section */}
      <Box
        bg={useColorModeValue('blue.50', 'gray.900')}
        minH="100vh"
        py={20}
      >
        <Container maxW="container.xl">
          <Stack
            direction={{ base: 'column', lg: 'row' }}
            spacing={8}
            align="center"
            justify="space-between"
          >
            <VStack
              spacing={6}
              align={{ base: 'center', lg: 'start' }}
              maxW="lg"
              textAlign={{ base: 'center', lg: 'left' }}
            >
              <Heading
                as="h1"
                size="2xl"
                fontWeight="bold"
                color={useColorModeValue('gray.900', 'white')}
              >
                Twój osobisty asystent zdrowego żywienia
              </Heading>
              <Text
                fontSize="xl"
                color={useColorModeValue('gray.600', 'gray.300')}
              >
                Odkryj spersonalizowane przepisy, planuj posiłki i osiągaj swoje cele żywieniowe z pomocą sztucznej inteligencji.
              </Text>
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                spacing={4}
                w={{ base: 'full', sm: 'auto' }}
              >
                <Button
                  as={RouterLink}
                  to="/register"
                  size="lg"
                  colorScheme="blue"
                  rounded="full"
                  px={8}
                >
                  Rozpocznij za darmo
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  rounded="full"
                  px={8}
                  onClick={handleOpenLoginModal}
                >
                  Zaloguj się
                </Button>
              </Stack>
            </VStack>
            <Box
              maxW={{ base: 'sm', lg: 'md' }}
              display={{ base: 'none', md: 'block' }}
            >
              <Image
                src="/assets/hero-image.png"
                alt="Zdrowe posiłki"
                rounded="2xl"
                shadow="2xl"
              />
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading>Dlaczego HealthyMeal?</Heading>
              <Text
                fontSize="lg"
                color={useColorModeValue('gray.600', 'gray.400')}
                maxW="2xl"
              >
                Nasza platforma łączy najnowsze technologie z wiedzą o zdrowym żywieniu, aby pomóc Ci osiągnąć Twoje cele.
              </Text>
            </VStack>

            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
              gap={8}
            >
              <Feature
                icon={FaUtensils}
                title="Spersonalizowane przepisy"
                description="Otrzymuj przepisy dopasowane do Twoich preferencji i celów żywieniowych."
              />
              <Feature
                icon={FaHeart}
                title="Zdrowe wybory"
                description="Dbamy o to, aby każdy przepis był zbilansowany i wartościowy."
              />
              <Feature
                icon={FaBrain}
                title="AI Asystent"
                description="Sztuczna inteligencja pomoże Ci w planowaniu posiłków i doborze składników."
              />
              <Feature
                icon={FaUserFriends}
                title="Społeczność"
                description="Dołącz do społeczności osób dbających o zdrowe odżywianie."
              />
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        bg={useColorModeValue('blue.50', 'gray.900')}
        py={16}
      >
        <Container maxW="container.xl">
          <VStack spacing={8} textAlign="center">
            <Heading size="xl">Gotowy na zdrową zmianę?</Heading>
            <Text fontSize="lg" maxW="2xl">
              Dołącz do tysięcy użytkowników, którzy już zmienili swoje nawyki żywieniowe z HealthyMeal.
            </Text>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
              <Button
                as={RouterLink}
                to="/register"
                size="lg"
                colorScheme="blue"
                rounded="full"
                px={8}
              >
                Rozpocznij teraz
              </Button>
              <Button
                size="lg"
                variant="outline"
                rounded="full"
                px={8}
                onClick={handleOpenLoginModal}
              >
                Zaloguj się
              </Button>
            </Stack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 