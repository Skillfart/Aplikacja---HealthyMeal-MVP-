import React, { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import styles from './RegisterModal.module.css';

export const RegisterModal = ({ onClose, onLoginLinkClick }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const { name, email, password, confirmPassword } = formData;
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Prosta walidacja
    if (!name || !email || !password || !confirmPassword) {
      setError('Proszę wypełnić wszystkie pola');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne');
      return;
    }
    
    if (password.length < 8) {
      setError('Hasło musi mieć co najmniej 8 znaków');
      return;
    }
    
    try {
      setLoading(true);
      
      // Dodaj dodatkowe logowanie dla debugowania
      console.log('Próba rejestracji użytkownika z email:', email);
      
      // Używamy AuthContext do rejestracji
      const { data, error: signUpError } = await signUp(email, password, name);
      
      if (signUpError) {
        console.error('Registration error:', signUpError);
        
        // Dodatkowe logowanie szczegółów błędu
        console.log('Błąd rejestracji - szczegóły:', {
          message: signUpError.message,
          status: signUpError.status,
          details: signUpError.details
        });
        
        // Obsługa różnych błędów rejestracji
        switch (signUpError.message) {
          case 'User already registered':
            setError('Użytkownik o tym adresie email już istnieje');
            break;
          case 'Invalid API key':
            setError('Błąd konfiguracji serwera - nieprawidłowy klucz API. Skontaktuj się z administratorem.');
            break;
          default:
            setError(`Błąd rejestracji: ${signUpError.message}`);
            break;
        }
        return;
      }
      
      console.log('Registration successful', data);
      
      // Zamknij modal
      onClose();
      
      // Przekieruj użytkownika lub pokaż komunikat o sukcesie
      alert('Rejestracja zakończona sukcesem! Sprawdź email aby potwierdzić konto.');
      
      // Opcjonalnie, przekieruj od razu do logowania
      onLoginLinkClick();
    } catch (err) {
      console.error('Unexpected registration error:', err);
      setError('Błąd rejestracji. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLoginClick = (e) => {
    e.preventDefault();
    onClose();
    onLoginLinkClick();
  };
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          &#10005;
        </button>
        <h2 className={styles.title}>Rejestracja</h2>
        
        {error && <p className={styles.error}>{error}</p>}
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Imię i nazwisko</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleChange}
              placeholder="Twoje imię i nazwisko"
              required
              disabled={loading}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleChange}
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
              onChange={handleChange}
              placeholder="Minimum 8 znaków"
              required
              minLength="8"
              disabled={loading}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Potwierdź hasło</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              placeholder="Powtórz hasło"
              required
              disabled={loading}
            />
          </div>
          
          <div className={styles.terms}>
            Klikając przycisk "Zarejestruj się", akceptujesz naszą{' '}
            <a href="#terms">Politykę prywatności</a> oraz{' '}
            <a href="#privacy">Warunki korzystania</a>.
          </div>
          
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Rejestracja...' : 'Zarejestruj się'}
          </button>
        </form>
        
        <div className={styles.switchMode}>
          Masz już konto?{' '}
          <a href="#login" onClick={handleLoginClick}>
            Zaloguj się
          </a>
        </div>
      </div>
    </div>
  );
}; 