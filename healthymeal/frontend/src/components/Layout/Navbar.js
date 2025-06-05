import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  useColorModeValue,
  Badge
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

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
        <Link as={RouterLink} to="/dashboard">
          <Text fontSize="xl" fontWeight="bold" color="green.500">
            HealthyMeal
          </Text>
        </Link>

        <Flex alignItems="center">
          <Stack direction="row" spacing={4} alignItems="center">
            {user?.aiUsage && (
              <Badge colorScheme="green" variant="subtle" p={2}>
                Pozostało modyfikacji AI: {5 - user.aiUsage.requestsToday}/5
              </Badge>
            )}
            
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={0}
              >
                <Avatar
                  size="sm"
                  name={user?.name || 'User'}
                  src={user?.avatarUrl}
                />
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to="/profile">
                  Profil
                </MenuItem>
                <MenuItem as={RouterLink} to="/recipes">
                  Moje przepisy
                </MenuItem>
                <MenuItem onClick={logout}>
                  Wyloguj się
                </MenuItem>
              </MenuList>
            </Menu>
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar; 