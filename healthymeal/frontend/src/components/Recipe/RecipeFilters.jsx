import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Select,
  Checkbox,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  Button,
  FormControl,
  FormLabel,
  Collapse,
  useDisclosure,
  Icon,
} from '@chakra-ui/react';
import { FaFilter, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { usePreferences } from '../../contexts/PreferencesContext';

export default function RecipeFilters({
  filters,
  onFiltersChange,
  onReset
}) {
  const { isOpen, onToggle } = useDisclosure();
  const { preferences } = usePreferences();

  const handleInputChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const handleCarbsRangeChange = ([min, max]) => {
    onFiltersChange({
      ...filters,
      carbsRange: { min, max }
    });
  };

  const handleTimeRangeChange = ([min, max]) => {
    onFiltersChange({
      ...filters,
      timeRange: { min, max }
    });
  };

  const handleDifficultyChange = (e) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      difficulty: value === 'all' ? null : value
    });
  };

  const handleDietTypeChange = (e) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      dietType: value === 'all' ? null : value
    });
  };

  const handleMatchPreferencesChange = (e) => {
    onFiltersChange({
      ...filters,
      matchPreferences: e.target.checked
    });
  };

  return (
    <Box
      borderWidth={1}
      borderRadius="lg"
      p={4}
      bg="white"
      shadow="sm"
    >
      <HStack
        justify="space-between"
        cursor="pointer"
        onClick={onToggle}
        pb={2}
      >
        <HStack>
          <Icon as={FaFilter} />
          <Text fontWeight="bold">Filtry</Text>
        </HStack>
        <Icon as={isOpen ? FaChevronUp : FaChevronDown} />
      </HStack>

      <Collapse in={isOpen}>
        <VStack spacing={4} align="stretch" pt={4}>
          {/* Wyszukiwanie */}
          <FormControl>
            <FormLabel>Szukaj przepisu</FormLabel>
            <Input
              placeholder="Wpisz nazwę przepisu..."
              value={filters.searchQuery || ''}
              onChange={(e) => handleInputChange('searchQuery', e.target.value)}
            />
          </FormControl>

          {/* Typ diety */}
          <FormControl>
            <FormLabel>Typ diety</FormLabel>
            <Select
              value={filters.dietType || 'all'}
              onChange={handleDietTypeChange}
            >
              <option value="all">Wszystkie</option>
              <option value="normal">Normalna</option>
              <option value="keto">Ketogeniczna</option>
              <option value="lowCarb">Niskowęglowodanowa</option>
              <option value="paleo">Paleo</option>
              <option value="vegetarian">Wegetariańska</option>
              <option value="vegan">Wegańska</option>
              <option value="glutenFree">Bezglutenowa</option>
              <option value="dairyFree">Bez nabiału</option>
            </Select>
          </FormControl>

          {/* Poziom trudności */}
          <FormControl>
            <FormLabel>Poziom trudności</FormLabel>
            <Select
              value={filters.difficulty || 'all'}
              onChange={handleDifficultyChange}
            >
              <option value="all">Wszystkie</option>
              <option value="easy">Łatwy</option>
              <option value="medium">Średni</option>
              <option value="hard">Trudny</option>
            </Select>
          </FormControl>

          {/* Zakres węglowodanów */}
          <FormControl>
            <FormLabel>
              Zawartość węglowodanów (g):{' '}
              {filters.carbsRange.min} - {filters.carbsRange.max}
            </FormLabel>
            <RangeSlider
              min={0}
              max={200}
              step={5}
              value={[filters.carbsRange.min, filters.carbsRange.max]}
              onChange={handleCarbsRangeChange}
            >
              <RangeSliderTrack>
                <RangeSliderFilledTrack />
              </RangeSliderTrack>
              <RangeSliderThumb index={0} />
              <RangeSliderThumb index={1} />
            </RangeSlider>
          </FormControl>

          {/* Czas przygotowania */}
          <FormControl>
            <FormLabel>
              Czas przygotowania (min):{' '}
              {filters.timeRange.min} - {filters.timeRange.max}
            </FormLabel>
            <RangeSlider
              min={0}
              max={180}
              step={5}
              value={[filters.timeRange.min, filters.timeRange.max]}
              onChange={handleTimeRangeChange}
            >
              <RangeSliderTrack>
                <RangeSliderFilledTrack />
              </RangeSliderTrack>
              <RangeSliderThumb index={0} />
              <RangeSliderThumb index={1} />
            </RangeSlider>
          </FormControl>

          {/* Zgodność z preferencjami */}
          <FormControl>
            <Checkbox
              isChecked={filters.matchPreferences}
              onChange={handleMatchPreferencesChange}
            >
              Tylko przepisy zgodne z moimi preferencjami
            </Checkbox>
          </FormControl>

          {/* Przyciski akcji */}
          <HStack justify="flex-end" pt={2}>
            <Button
              variant="ghost"
              onClick={onReset}
            >
              Resetuj filtry
            </Button>
          </HStack>
        </VStack>
      </Collapse>
    </Box>
  );
} 