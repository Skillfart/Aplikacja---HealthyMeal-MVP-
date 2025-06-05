import React from 'react';
import { Box, Container, Heading, Text, Button, VStack, Flex, Image, useColorModeValue, Icon } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FaLeaf, FaRobot, FaUsers, FaHeart, FaBrain, FaAppleAlt } from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('teal.500', 'teal.600');

  return (
    <Box>
      {/* Hero Section */}
      <Box bg={headerBg} color="white" py={20} position="relative" overflow="hidden">
        <MotionBox
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-r, teal.500, green.400)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        
        <Container maxW="container.xl" position="relative">
          <MotionFlex
            direction="column"
            align="center"
            textAlign="center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Heading
              as="h1"
              size="2xl"
              mb={6}
              bgGradient="linear(to-r, white, green.100)"
              bgClip="text"
            >
              Odkryj Świat Zdrowego Gotowania
            </Heading>
            <Text fontSize="xl" mb={8} maxW="2xl">
              HealthyMeal to Twój osobisty asystent kulinarny, który pomoże Ci tworzyć 
              zdrowe i pyszne posiłki, dostosowane do Twoich potrzeb i preferencji.
            </Text>

            <Flex gap={4} flexWrap="wrap" justify="center">
              {isAuthenticated ? (
                <Button
                  as={RouterLink}
                  to="/dashboard"
                  size="lg"
                  colorScheme="white"
                  variant="solid"
                  bg="white"
                  color="teal.500"
                  _hover={{ bg: 'gray.100' }}
                  leftIcon={<FaLeaf />}
                >
                  Przejdź do aplikacji
                </Button>
              ) : (
                <>
                  <Button
                    as={RouterLink}
                    to="/login"
                    size="lg"
                    colorScheme="white"
                    variant="solid"
                    bg="white"
                    color="teal.500"
                    _hover={{ bg: 'gray.100' }}
                  >
                    Zaloguj się
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/register"
                    size="lg"
                    variant="outline"
                    color="white"
                    _hover={{ bg: 'whiteAlpha.200' }}
                  >
                    Dołącz za darmo
                  </Button>
                </>
              )}
            </Flex>
          </MotionFlex>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20} bg={bgColor}>
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <Heading
              as="h2"
              size="xl"
              textAlign="center"
              mb={12}
              color="teal.600"
            >
              Dlaczego HealthyMeal?
            </Heading>

            <Flex
              wrap="wrap"
              gap={8}
              justify="center"
            >
              <Feature
                icon={FaBrain}
                title="AI Asystent"
                description="Wykorzystaj sztuczną inteligencję do modyfikacji przepisów i tworzenia spersonalizowanych planów żywieniowych"
              />
              <Feature
                icon={FaHeart}
                title="Zdrowe Wybory"
                description="Otrzymuj przepisy dopasowane do Twoich celów zdrowotnych i preferencji żywieniowych"
              />
              <Feature
                icon={FaUsers}
                title="Społeczność"
                description="Dołącz do społeczności pasjonatów zdrowego gotowania i wymieniaj się przepisami"
              />
            </Flex>
          </VStack>
        </Container>
      </Box>

      {/* How it Works Section */}
      <Box py={20} bg="gray.50">
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Heading
              as="h2"
              size="xl"
              textAlign="center"
              color="teal.600"
            >
              Jak to działa?
            </Heading>

            <Flex
              wrap="wrap"
              gap={8}
              justify="center"
            >
              <Step
                number="1"
                title="Wybierz przepis"
                description="Przeglądaj naszą bazę sprawdzonych przepisów lub dodaj własne"
              />
              <Step
                number="2"
                title="Dostosuj do siebie"
                description="Modyfikuj składniki i proporcje według swoich potrzeb"
              />
              <Step
                number="3"
                title="Gotuj z AI"
                description="Pozwól naszemu asystentowi AI pomóc Ci w przygotowaniu posiłku"
              />
            </Flex>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20} bg="teal.500" color="white">
        <Container maxW="container.xl">
          <VStack spacing={8} textAlign="center">
            <Heading size="xl">Rozpocznij swoją kulinarną przygodę</Heading>
            <Text fontSize="xl" maxW="2xl">
              Dołącz do tysięcy użytkowników, którzy już odkryli radość ze zdrowego gotowania
            </Text>
            {!isAuthenticated && (
              <Button
                as={RouterLink}
                to="/register"
                size="lg"
                colorScheme="white"
                variant="solid"
                bg="white"
                color="teal.500"
                _hover={{ bg: 'gray.100' }}
              >
                Zarejestruj się za darmo
              </Button>
            )}
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

const Feature = ({ icon, title, description }) => (
  <MotionBox
    bg="white"
    p={8}
    rounded="xl"
    shadow="xl"
    flex="1"
    minW={["100%", "45%", "30%"]}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <Icon as={icon} w={10} h={10} color="teal.500" mb={4} />
    <Heading as="h3" size="md" mb={4} color="teal.600">
      {title}
    </Heading>
    <Text color="gray.600" fontSize="lg">
      {description}
    </Text>
  </MotionBox>
);

const Step = ({ number, title, description }) => (
  <MotionBox
    bg="white"
    p={8}
    rounded="xl"
    shadow="md"
    flex="1"
    minW={["100%", "45%", "30%"]}
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <Flex align="center" mb={4}>
      <Box
        bg="teal.500"
        color="white"
        rounded="full"
        w={12}
        h={12}
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="xl"
        fontWeight="bold"
      >
        {number}
      </Box>
      <Heading as="h3" size="md" ml={4} color="teal.600">
        {title}
      </Heading>
    </Flex>
    <Text color="gray.600" fontSize="lg">
      {description}
    </Text>
  </MotionBox>
);

export default LandingPage;