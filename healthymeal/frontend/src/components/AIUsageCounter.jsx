import React from 'react';
import {
  Box,
  Text,
  CircularProgress,
  CircularProgressLabel,
  Tooltip,
  VStack,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FaRobot, FaClock, FaExclamationTriangle } from 'react-icons/fa';

export default function AIUsageCounter({ dailyUsage, hourlyUsage, minuteUsage }) {
  const dailyLimit = 5;
  const hourlyLimit = 3;
  const minuteLimit = 1;

  const getDailyColor = () => {
    const percentage = (dailyUsage / dailyLimit) * 100;
    if (percentage >= 80) return 'red.500';
    if (percentage >= 60) return 'orange.500';
    return 'green.500';
  };

  const getHourlyColor = () => {
    const percentage = (hourlyUsage / hourlyLimit) * 100;
    if (percentage >= 80) return 'red.500';
    if (percentage >= 60) return 'orange.500';
    return 'green.500';
  };

  const getMinuteColor = () => {
    return minuteUsage >= minuteLimit ? 'red.500' : 'green.500';
  };

  return (
    <Box
      p={4}
      borderWidth={1}
      borderRadius="lg"
      bg="white"
      shadow="sm"
    >
      <VStack spacing={4} align="stretch">
        <HStack spacing={2}>
          <Icon as={FaRobot} />
          <Text fontWeight="bold">Licznik modyfikacji AI</Text>
        </HStack>

        <HStack spacing={6} justify="center">
          {/* Dzienny limit */}
          <Tooltip
            label={`${dailyUsage} z ${dailyLimit} modyfikacji dziennie`}
            placement="top"
          >
            <Box>
              <CircularProgress
                value={(dailyUsage / dailyLimit) * 100}
                color={getDailyColor()}
                size="60px"
              >
                <CircularProgressLabel>
                  {dailyUsage}/{dailyLimit}
                </CircularProgressLabel>
              </CircularProgress>
              <Text fontSize="sm" textAlign="center" mt={1}>
                Dziennie
              </Text>
            </Box>
          </Tooltip>

          {/* Godzinowy limit */}
          <Tooltip
            label={`${hourlyUsage} z ${hourlyLimit} modyfikacji na godzinę`}
            placement="top"
          >
            <Box>
              <CircularProgress
                value={(hourlyUsage / hourlyLimit) * 100}
                color={getHourlyColor()}
                size="60px"
              >
                <CircularProgressLabel>
                  {hourlyUsage}/{hourlyLimit}
                </CircularProgressLabel>
              </CircularProgress>
              <Text fontSize="sm" textAlign="center" mt={1}>
                Godzinowo
              </Text>
            </Box>
          </Tooltip>

          {/* Minutowy limit */}
          <Tooltip
            label={`${minuteUsage} z ${minuteLimit} modyfikacji na minutę`}
            placement="top"
          >
            <Box>
              <CircularProgress
                value={(minuteUsage / minuteLimit) * 100}
                color={getMinuteColor()}
                size="60px"
              >
                <CircularProgressLabel>
                  {minuteUsage}/{minuteLimit}
                </CircularProgressLabel>
              </CircularProgress>
              <Text fontSize="sm" textAlign="center" mt={1}>
                Minutowo
              </Text>
            </Box>
          </Tooltip>
        </HStack>

        {(dailyUsage >= dailyLimit || hourlyUsage >= hourlyLimit || minuteUsage >= minuteLimit) && (
          <HStack color="red.500" spacing={2}>
            <Icon as={FaExclamationTriangle} />
            <Text fontSize="sm">
              Osiągnięto limit modyfikacji. Poczekaj przed kolejną próbą.
            </Text>
          </HStack>
        )}

        <HStack color="gray.500" spacing={2} fontSize="sm">
          <Icon as={FaClock} />
          <Text>
            Limity odnawiają się automatycznie po upływie odpowiedniego czasu.
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
} 