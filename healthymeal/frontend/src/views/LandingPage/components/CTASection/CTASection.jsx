import React from 'react';
import styles from './CTASection.module.css';

export const CTASection = ({ onCtaClick }) => {
  return (
    <section className={styles.ctaSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Gotowy na zdrowe gotowanie?</h2>
        <p className={styles.subtitle}>
          Dołącz do społeczności HealthyMeal i zacznij tworzyć zdrowsze wersje swoich ulubionych przepisów już dzisiaj.
        </p>
        <button 
          className={styles.ctaButton}
          onClick={onCtaClick}
        >
          Utwórz darmowe konto
        </button>
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.check}>✓</span>
            <span>Bez ukrytych opłat</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.check}>✓</span>
            <span>Dostęp do wszystkich funkcji</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.check}>✓</span>
            <span>Anuluj w dowolnym momencie</span>
          </div>
        </div>
      </div>
    </section>
  );
}; 