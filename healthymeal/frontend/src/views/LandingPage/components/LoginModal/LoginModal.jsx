import React, { useState } from 'react';
import { supabase } from '../../../../lib/supabase.js';
import styles from './LoginModal.module.css';

export const LoginModal = ({ onClose, onRegisterLinkClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Proszę wypełnić wszystkie pola');
      return;
    }
    
    try {
      setLoading(true);
      
      // Logowanie przez Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (signInError) {
        console.error('Login error:', signInError);
        
        // Obsługa błędów logowania
        switch (signInError.message) {
          case 'Invalid login credentials':
            setError('Nieprawidłowy email lub hasło');
            break;
          case 'Email not confirmed':
            setError('Email nie został potwierdzony. Sprawdź swoją skrzynkę email.');
            break;
          default:
            setError(`Błąd logowania: ${signInError.message}`);
            break;
        }
        return;
      }
      
      console.log('Login successful', data);
      
      // Zamknij modal
      onClose();
      
      // Przekieruj użytkownika na stronę główną lub dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Unexpected login error:', err);
      setError('Błąd logowania. Spróbuj ponownie później.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegisterClick = (e) => {
    e.preventDefault();
    onClose();
    onRegisterLinkClick();
  };
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          &#10005;
        </button>
        <h2 className={styles.title}>Logowanie</h2>
        
        {error && <p className={styles.error}>{error}</p>}
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Twój email"
              required
              disabled={loading}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">Hasło</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Twoje hasło"
              required
              disabled={loading}
            />
          </div>
          
          <div className={styles.forgotPassword}>
            <a href="#reset-password">Zapomniałeś hasła?</a>
          </div>
          
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>
        
        <div className={styles.switchMode}>
          Nie masz konta?{' '}
          <a href="#register" onClick={handleRegisterClick}>
            Zarejestruj się
          </a>
        </div>
      </div>
    </div>
  );
}; 