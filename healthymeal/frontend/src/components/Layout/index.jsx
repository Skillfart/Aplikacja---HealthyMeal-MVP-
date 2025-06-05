import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import Navbar from '../Navbar';

/**
 * Komponent układu strony z nawigacją i kontenerem treści
 * @param {Object} props - Właściwości komponentu
 * @param {React.ReactNode} props.children - Komponenty potomne
 * @returns {JSX.Element} Układ strony
 */
const Layout = ({ children }) => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="container.xl" py={8}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout; 