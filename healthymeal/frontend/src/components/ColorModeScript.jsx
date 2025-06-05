import { ColorModeScript as ChakraColorModeScript } from '@chakra-ui/react';
import theme from '../theme';

const ColorModeScript = () => {
  return <ChakraColorModeScript initialColorMode={theme.config.initialColorMode} />;
};

export default ColorModeScript; 