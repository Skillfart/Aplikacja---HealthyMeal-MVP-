import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Select,
  Textarea,
  VStack,
  useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { submitFeedback } from '../../services/feedbackService';

/**
 * @typedef {Object} FeedbackData
 * @property {string} type - Typ zgłoszenia
 * @property {string} description - Opis problemu
 */

/**
 * Komponent formularza zgłaszania błędów
 * @returns {JSX.Element} Formularz zgłaszania błędów
 */
const Feedback = () => {
  /** @type {[FeedbackData, Function]} */
  const [feedback, setFeedback] = useState({
    type: '',
    description: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  /**
   * Obsługa wysyłania zgłoszenia
   * @param {React.FormEvent<HTMLFormElement>} e - Event formularza
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await submitFeedback(feedback);
      toast({
        title: 'Sukces',
        description: 'Dziękujemy za zgłoszenie. Zajmiemy się nim jak najszybciej.',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się wysłać zgłoszenia. Spróbuj ponownie później.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Zgłoś problem</Heading>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={6}>
            <FormControl isRequired>
              <FormLabel>Typ zgłoszenia</FormLabel>
              <Select
                value={feedback.type}
                onChange={(e) => setFeedback({
                  ...feedback,
                  type: e.target.value
                })}
                placeholder="Wybierz typ zgłoszenia"
              >
                <option value="error">Błąd w przepisie</option>
                <option value="suggestion">Sugestia ulepszenia</option>
                <option value="bug">Problem techniczny</option>
                <option value="other">Inne</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Opis problemu</FormLabel>
              <Textarea
                value={feedback.description}
                onChange={(e) => setFeedback({
                  ...feedback,
                  description: e.target.value
                })}
                placeholder="Opisz szczegółowo problem lub sugestię..."
                minH="200px"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              isLoading={submitting}
              width="full"
            >
              Wyślij zgłoszenie
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default Feedback; 