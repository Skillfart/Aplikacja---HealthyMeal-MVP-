import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export const NotFound = () => {
  return (
    <div className={styles.notFoundContainer}>
      <h1>404</h1>
      <h2>Strona nie została znaleziona</h2>
      <p>Przepraszamy, strona której szukasz nie istnieje lub została przeniesiona.</p>
      <div className={styles.actions}>
        <Link to="/" className={styles.homeLink}>Strona główna</Link>
        {localStorage.getItem('token') && (
          <Link to="/dashboard" className={styles.dashboardLink}>Przejdź do panelu użytkownika</Link>
        )}
      </div>
    </div>
  );
}; 