import React from 'react';
import { Center, Spinner, Text, VStack } from '@chakra-ui/react';

/**
 * Komponent ładowania z animowanym spinnerem
 * @param {Object} props - Właściwości komponentu
 * @param {string} [props.message='Ładowanie...'] - Wiadomość wyświetlana pod spinnerem
 * @returns {JSX.Element} Komponent ładowania
 */
const LoadingSpinner = ({ message = 'Ładowanie...' }) => {
  return (
    <Center h="100vh">
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
        <Text>{message}</Text>
      </VStack>
    </Center>
  );
};

export default LoadingSpinner; 