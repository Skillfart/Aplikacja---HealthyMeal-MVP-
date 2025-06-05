import React from 'react';
import {
  Box,
  Image,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
  IconButton,
  useDisclosure,
  Tooltip,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import {
  FaClock,
  FaUtensils,
  FaCarrot,
  FaHeart,
  FaEllipsisV,
  FaPencilAlt,
  FaTrash,
  FaExchangeAlt,
} from 'react-icons/fa';

/**
 * @typedef {import('../../types').Recipe} Recipe
 */

/**
 * Formatuje czas przygotowania na przyjazny dla użytkownika format
 * @param {number} minutes - Czas w minutach
 * @returns {string} Sformatowany czas
 */
const formatTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} godz ${remainingMinutes > 0 ? `${remainingMinutes} min` : ''}`;
};

/**
 * Komponent karty przepisu
 * @param {Object} props - Właściwości komponentu
 * @param {Recipe} props.recipe - Przepis do wyświetlenia
 * @param {boolean} [props.isCompact] - Czy wyświetlać kompaktową wersję karty
 * @returns {JSX.Element} Karta przepisu
 */
const RecipeCard = ({ recipe, preferences, onDelete }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isLowCarb = recipe.nutritionalValues.carbs <= preferences.maxCarbs;
  const matchesDiet = preferences.dietType === 'normal' || recipe.dietType === preferences.dietType;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'green';
      case 'medium':
        return 'yellow';
      case 'hard':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'Łatwy';
      case 'medium':
        return 'Średni';
      case 'hard':
        return 'Trudny';
      default:
        return 'Nieznany';
    }
  };

  return (
    <Box
      as={RouterLink}
      to={`/recipes/${recipe._id}`}
      borderWidth={1}
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      shadow="sm"
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        shadow: 'md',
      }}
      position="relative"
    >
      {/* Zdjęcie przepisu */}
      <Box position="relative">
        <Image
          src={recipe.image || '/default-recipe-image.jpg'}
          alt={recipe.title}
          objectFit="cover"
          height="200px"
          width="100%"
        />
        
        {/* Odznaki w prawym górnym rogu */}
        <Box
          position="absolute"
          top={2}
          right={2}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          {isLowCarb && (
            <Tooltip label="W normie węglowodanowej" placement="left">
              <Badge colorScheme="green" px={2} py={1}>
                <Icon as={FaCarrot} mr={1} />
                Low Carb
              </Badge>
            </Tooltip>
          )}
          {matchesDiet && (
            <Tooltip label="Zgodne z Twoją dietą" placement="left">
              <Badge colorScheme="blue" px={2} py={1}>
                <Icon as={FaHeart} mr={1} />
                Dieta OK
              </Badge>
            </Tooltip>
          )}
        </Box>

        {/* Menu akcji */}
        <Box
          position="absolute"
          top={2}
          right={2}
          zIndex={1}
          onClick={(e) => e.preventDefault()}
        >
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant="ghost"
              color="white"
              _hover={{ bg: 'whiteAlpha.300' }}
            />
            <MenuList>
              <MenuItem
                as={RouterLink}
                to={`/recipes/${recipe._id}/edit`}
                icon={<FaPencilAlt />}
              >
                Edytuj
              </MenuItem>
              <MenuItem
                as={RouterLink}
                to={`/recipes/${recipe._id}/compare`}
                icon={<FaExchangeAlt />}
              >
                Porównaj i modyfikuj
              </MenuItem>
              <MenuItem
                icon={<FaTrash />}
                color="red.500"
                onClick={(e) => {
                  e.preventDefault();
                  onDelete?.(recipe._id);
                }}
              >
                Usuń
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>

      {/* Informacje o przepisie */}
      <VStack p={4} align="stretch" spacing={3}>
        <Heading size="md" noOfLines={2}>
          {recipe.title}
        </Heading>

        <Text noOfLines={2} color="gray.600" fontSize="sm">
          {recipe.description}
        </Text>

        <HStack spacing={4}>
          <HStack>
            <Icon as={FaClock} color="gray.500" />
            <Text fontSize="sm">{formatTime(recipe.preparationTime)}</Text>
          </HStack>

          <HStack>
            <Icon as={FaUtensils} color="gray.500" />
            <Badge colorScheme={getDifficultyColor(recipe.difficulty)}>
              {getDifficultyLabel(recipe.difficulty)}
            </Badge>
          </HStack>

          <HStack>
            <Icon as={FaCarrot} color="gray.500" />
            <Text fontSize="sm">
              {recipe.nutritionalValues.carbs}g
            </Text>
          </HStack>
        </HStack>

        {/* Tagi diety */}
        <HStack spacing={2} flexWrap="wrap">
          {recipe.dietType && (
            <Badge colorScheme="purple" variant="subtle">
              {recipe.dietType}
            </Badge>
          )}
          {recipe.tags?.map((tag, index) => (
            <Badge key={index} colorScheme="blue" variant="subtle">
              {tag}
            </Badge>
          ))}
        </HStack>
      </VStack>
    </Box>
  );
};

export default RecipeCard; 