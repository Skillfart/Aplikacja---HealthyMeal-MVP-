import React, { useState, useEffect } from 'react';
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import './EnvironmentIndicator.css';
import { isTestEnvironment, isTestUser, isMockMode } from '../../utils/testEnvironment';

/**
 * Komponent wyświetlający wskaźnik aktualnego środowiska aplikacji
 * @returns {JSX.Element} Element wskaźnika środowiska
 */
const EnvironmentIndicator = () => {
  const [environment, setEnvironment] = useState('');
  const [testUser, setTestUser] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [apiUsage, setApiUsage] = useState(null);

  useEffect(() => {
    // Sprawdź aktualne środowisko na podstawie zmiennych NODE_ENV i innych flag
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    // Użyj funkcji pomocniczych z testEnvironment.js
    const testMode = isTestEnvironment();
    const userIsTest = isTestUser();
    const useMocks = isMockMode();
    
    // Pobierz dane o wykorzystaniu API z localStorage (jeśli istnieją)
    const usageData = localStorage.getItem('ai_usage');
    if (usageData) {
      try {
        setApiUsage(JSON.parse(usageData));
      } catch (error) {
        console.error('Błąd podczas parsowania danych AI usage:', error);
      }
    }

    setEnvironment(nodeEnv);
    setTestUser(userIsTest);
    setMockMode(useMocks);
  }, []);

  // Nie wyświetlaj wskaźnika w środowisku produkcyjnym, chyba że jest to użytkownik testowy
  if (environment === 'production' && !testUser && !mockMode) {
    return null;
  }

  // Określ odpowiedni kolor i tekst na podstawie środowiska
  let variant = 'secondary';
  let text = environment.toUpperCase();
  let tooltipText = 'Środowisko produkcyjne';

  if (environment === 'development') {
    variant = 'info';
    text = 'DEV MODE';
    tooltipText = 'Środowisko deweloperskie - dane mogą być niepełne lub symulowane';
  } else if (environment === 'test' || testUser) {
    variant = 'warning';
    text = 'TEST MODE';
    tooltipText = 'Środowisko testowe - dane są symulowane dla celów testowych';
  } else if (mockMode) {
    variant = 'danger';
    text = 'MOCK MODE';
    tooltipText = 'Tryb symulacji - wszystkie odpowiedzi API są mockowane';
  }

  // Jeśli mamy dane o wykorzystaniu API, dodaj je do tooltipa
  if (apiUsage) {
    tooltipText += `\nWykorzystanie AI: ${apiUsage.used}/${apiUsage.dailyLimit} zapytań`;
  }

  return (
    <div className="environment-indicator">
      <OverlayTrigger
        placement="bottom"
        overlay={<Tooltip>{tooltipText}</Tooltip>}
      >
        <Badge bg={variant} className="environment-badge">
          {text}
        </Badge>
      </OverlayTrigger>
    </div>
  );
};

export default EnvironmentIndicator; 