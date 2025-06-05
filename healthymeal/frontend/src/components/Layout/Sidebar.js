import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  VStack,
  Link,
  Icon,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { FiHome, FiBook, FiUser, FiPlusCircle } from 'react-icons/fi';

const MenuItem = ({ icon, children, to, isActive }) => {
  const activeColor = useColorModeValue('green.500', 'green.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Link
      as={RouterLink}
      to={to}
      w="full"
      p={3}
      borderRadius="md"
      _hover={{ bg: hoverBg }}
      bg={isActive ? hoverBg : 'transparent'}
      color={isActive ? activeColor : undefined}
      display="flex"
      alignItems="center"
      textDecoration="none"
    >
      <Icon as={icon} mr={3} />
      <Text fontWeight={isActive ? 'bold' : 'normal'}>{children}</Text>
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const menuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
    { icon: FiBook, label: 'Przepisy', path: '/recipes' },
    { icon: FiPlusCircle, label: 'Nowy przepis', path: '/recipes/new' },
    { icon: FiUser, label: 'Profil', path: '/profile' }
  ];

  return (
    <Box
      w="240px"
      h="calc(100vh - 64px)"
      borderRight="1px"
      borderColor={borderColor}
      py={4}
      position="sticky"
      top="64px"
    >
      <VStack spacing={2} align="stretch" px={3}>
        {menuItems.map((item) => (
          <MenuItem
            key={item.path}
            icon={item.icon}
            to={item.path}
            isActive={location.pathname === item.path}
          >
            {item.label}
          </MenuItem>
        ))}
      </VStack>
    </Box>
  );
};

export default Sidebar; 