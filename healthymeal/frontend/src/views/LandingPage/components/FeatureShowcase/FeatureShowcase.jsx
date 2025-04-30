import React from 'react';
import { FeatureCard } from './FeatureCard';
import styles from './FeatureShowcase.module.css';

const features = [
  {
    id: 'ai-modification',
    title: 'Modyfikacja przepisów przez AI',
    description: 'Dostosuj swoje ulubione przepisy do diety niskowęglowodanowej, zachowując ich smak i charakter.',
    iconName: 'ai'
  },
  {
    id: 'dietary-preferences',
    title: 'Osobiste preferencje żywieniowe',
    description: 'Określ swoje wymagania dietetyczne, alergeny i produkty do wykluczenia. Wszystkie modyfikacje będą je uwzględniać.',
    iconName: 'preferences'
  },
  {
    id: 'nutrition-tracking',
    title: 'Śledzenie wartości odżywczych',
    description: 'Monitoruj zawartość węglowodanów, kalorii i innych składników odżywczych w oryginalnych i zmodyfikowanych przepisach.',
    iconName: 'nutrition'
  },
  {
    id: 'recipe-management',
    title: 'Łatwe zarządzanie przepisami',
    description: 'Dodawaj, modyfikuj i organizuj swoje przepisy w jednym miejscu z intuicyjnym interfejsem.',
    iconName: 'management'
  }
];

export const FeatureShowcase = () => {
  return (
    <section className={styles.featureShowcase}>
      <div className={styles.container}>
        <h2 className={styles.heading}>Dlaczego HealthyMeal?</h2>
        <p className={styles.subheading}>
          Nasza aplikacja oferuje unikalne funkcje, które pomogą Ci cieszyć się 
          zdrowszymi wersjami Twoich ulubionych potraw.
        </p>
        
        <div className={styles.featuresGrid}>
          {features.map(feature => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              iconName={feature.iconName}
            />
          ))}
        </div>
      </div>
    </section>
  );
}; 