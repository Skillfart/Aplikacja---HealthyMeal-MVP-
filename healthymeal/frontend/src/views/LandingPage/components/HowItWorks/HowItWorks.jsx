import React from 'react';
import styles from './HowItWorks.module.css';

export const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: 'Utwórz konto',
      description: 'Zarejestruj się, aby uzyskać dostęp do wszystkich funkcji i zapisać swoje preferencje dietetyczne.'
    },
    {
      id: 2,
      title: 'Dodaj przepis',
      description: 'Wprowadź przepis, który chcesz zmodyfikować lub wybierz z naszej bazy przepisów.'
    },
    {
      id: 3,
      title: 'Wybierz ograniczenia',
      description: 'Wskaż swoje preferencje dietetyczne lub specyficzne potrzeby zdrowotne.'
    },
    {
      id: 4,
      title: 'AI modyfikuje przepis',
      description: 'Nasz system AI automatycznie dostosuje przepis do Twoich potrzeb, zachowując smak i wartości odżywcze.'
    }
  ];

  return (
    <section className={styles.howItWorks}>
      <div className={styles.container}>
        <h2 className={styles.title}>Jak to działa</h2>
        <p className={styles.subtitle}>Poznaj prosty proces modyfikacji przepisów z HealthyMeal</p>
        
        <div className={styles.stepsContainer}>
          {steps.map(step => (
            <div key={step.id} className={styles.step}>
              <div className={styles.stepNumber}>{step.id}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 