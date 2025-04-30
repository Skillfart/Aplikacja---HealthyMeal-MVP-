import React from 'react';
import styles from './HeroSection.module.css';

export const HeroSection = ({ onCtaClick }) => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.container}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Zdrowsze wersje Twoich ulubionych przepisów
          </h1>
          <p className={styles.subtitle}>
            HealthyMeal pomoże Ci automatycznie dostosować przepisy do Twoich potrzeb dietetycznych, szczególnie przy insulinooporności i cukrzycy typu 2.
          </p>
          <button className={styles.ctaButton} onClick={onCtaClick}>
            Rozpocznij za darmo
          </button>
        </div>
        <div className={styles.heroImageContainer}>
          <div className={styles.imagePlaceholder}>
            Zdrowe i smaczne posiłki dla każdego
          </div>
        </div>
      </div>
    </section>
  );
}; 