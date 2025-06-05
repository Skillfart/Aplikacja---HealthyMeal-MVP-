import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

export const Header = ({ onLoginClick, onRegisterClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <img 
            src="/images/logo.svg" 
            alt="HealthyMeal Logo" 
            className={styles.logoImage} 
            width="32" 
            height="32" 
          />
          <span className={styles.logoText}>HealthyMeal</span>
        </Link>

        {/* Desktop menu */}
        <nav className={styles.desktopNav}>
          <button 
            onClick={onLoginClick} 
            className={styles.loginButton}
            aria-label="Zaloguj się"
          >
            Zaloguj się
          </button>
          <button 
            onClick={onRegisterClick} 
            className={styles.registerButton}
            aria-label="Zarejestruj się"
          >
            Zarejestruj się
          </button>
        </nav>

        {/* Mobile menu button */}
        <button 
          className={styles.mobileMenuButton} 
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={mobileMenuOpen}
        >
          <span className={styles.hamburgerIcon}></span>
        </button>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <button 
              onClick={() => {
                onLoginClick();
                setMobileMenuOpen(false);
              }} 
              className={styles.mobileMenuItem}
            >
              Zaloguj się
            </button>
            <button 
              onClick={() => {
                onRegisterClick();
                setMobileMenuOpen(false);
              }} 
              className={styles.mobileMenuItem}
            >
              Zarejestruj się
            </button>
          </div>
        )}
      </div>
    </header>
  );
}; 