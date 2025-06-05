import React from 'react';
import {
  Box,
  Flex,
  Link,
  Button,
  Stack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Komponent nawigacji głównej
 * @returns {JSX.Element} Pasek nawigacji
 */
const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Błąd wylogowania:', error);
    }
  };

  return (
    <Box
      bg={bgColor}
      px={4}
      borderBottom={1}
      borderStyle="solid"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex="sticky"
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Link as={RouterLink} to="/" fontSize="xl" fontWeight="bold" _hover={{ textDecoration: 'none' }}>
          HealthyMeal
        </Link>

        <Flex alignItems="center">
          {user ? (
            <Stack direction="row" spacing={4} alignItems="center">
              <Link as={RouterLink} to="/dashboard" _hover={{ textDecoration: 'none' }}>
                Dashboard
              </Link>
              <Link as={RouterLink} to="/recipes" _hover={{ textDecoration: 'none' }}>
                Przepisy
              </Link>
              <Menu>
                <MenuButton
                  as={Button}
                  rounded="full"
                  variant="link"
                  cursor="pointer"
                  minW={0}
                >
                  <Avatar size="sm" name={user.email} />
                </MenuButton>
                <MenuList>
                  <MenuItem as={RouterLink} to="/profile">
                    Profil
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/profile/preferences">
                    Preferencje
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/feedback">
                    Zgłoś problem
                  </MenuItem>
                  <MenuItem onClick={handleSignOut}>
                    Wyloguj się
                  </MenuItem>
                </MenuList>
              </Menu>
            </Stack>
          ) : (
            <Stack direction="row" spacing={4}>
              <Button as={RouterLink} to="/login" variant="ghost">
                Zaloguj się
              </Button>
              <Button as={RouterLink} to="/register" colorScheme="blue">
                Zarejestruj się
              </Button>
            </Stack>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar; 