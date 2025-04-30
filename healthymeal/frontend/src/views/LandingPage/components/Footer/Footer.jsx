import React from 'react';
import styles from './Footer.module.css';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.columns}>
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>HealthyMeal</h3>
            <p className={styles.description}>
              Aplikacja pomagająca osobom z ograniczeniami dietetycznymi w tworzeniu 
              zdrowszych wersji ulubionych przepisów.
            </p>
          </div>
          
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Linki</h3>
            <ul className={styles.links}>
              <li><a href="#home">Strona główna</a></li>
              <li><a href="#features">Funkcje</a></li>
              <li><a href="#about">O nas</a></li>
              <li><a href="#contact">Kontakt</a></li>
            </ul>
          </div>
          
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Zasoby</h3>
            <ul className={styles.links}>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#tutorials">Poradniki</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#support">Wsparcie</a></li>
            </ul>
          </div>
          
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Kontakt</h3>
            <ul className={styles.contactInfo}>
              <li>kontakt@healthymeal.pl</li>
              <li>+48 123 456 789</li>
              <li>ul. Przykładowa 123, 00-000 Warszawa</li>
            </ul>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {currentYear} HealthyMeal. Wszelkie prawa zastrzeżone.
          </p>
          <div className={styles.legal}>
            <a href="#privacy">Polityka prywatności</a>
            <a href="#terms">Warunki korzystania</a>
            <a href="#cookies">Polityka cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}; 