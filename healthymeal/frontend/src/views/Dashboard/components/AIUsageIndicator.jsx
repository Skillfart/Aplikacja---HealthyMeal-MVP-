import React from 'react';
import { Box, Progress, Text, Tooltip } from '@chakra-ui/react';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Komponent wyświetlający wskaźnik wykorzystania dziennego limitu AI
 * @returns {JSX.Element} Wskaźnik użycia AI
 */
const AIUsageIndicator = () => {
  const { user } = useAuth();
  const aiUsage = user?.aiUsage || { count: 0 };
  const dailyLimit = 5;
  const usagePercentage = (aiUsage.count / dailyLimit) * 100;

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" mb={4}>
      <Text mb={2}>Wykorzystanie AI dzisiaj</Text>
      <Tooltip label={`${aiUsage.count} z ${dailyLimit} modyfikacji`}>
        <Box>
          <Progress
            value={usagePercentage}
            colorScheme={usagePercentage >= 80 ? 'red' : 'green'}
            size="lg"
            borderRadius="md"
          />
        </Box>
      </Tooltip>
      <Text mt={2} fontSize="sm" color="gray.600">
        Pozostało: {dailyLimit - aiUsage.count} modyfikacji
      </Text>
    </Box>
  );
};

export default AIUsageIndicator; 