import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import { getAuthStatus } from '../../lib/supabase';

// Style dla komponentu
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#f5f5f5',
  },
  logoContainer: {
    marginBottom: '30px',
    textAlign: 'center',
  },
  logo: {
    height: '60px',
  },
  loginContainer: {
    width: '100%',
    maxWidth: '450px',
  },
  bottomLinks: {
    marginTop: '20px',
    textAlign: 'center',
    color: '#666',
  },
  link: {
    color: '#4CAF50',
    textDecoration: 'none',
    marginLeft: '5px',
  },
  successMessage: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '15px',
    borderRadius: '4px',
    textAlign: 'center',
    marginBottom: '20px',
  },
};

const LoginPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  // Sprawdzenie stanu autentykacji przy ładowaniu komponentu
  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated } = await getAuthStatus();
      
      if (isAuthenticated) {
        // Jeśli użytkownik jest już zalogowany, przekieruj do dashboardu
        navigate('/dashboard');
      }
      
      setIsAuthenticated(isAuthenticated);
    };
    
    checkAuth();
  }, [navigate]);

  // Jeśli użytkownik jest już zalogowany, nie pokazuj strony logowania
  if (isAuthenticated) {
    return null; // lub możesz pokazać komunikat o przekierowaniu
  }

  const handleLoginSuccess = () => {
    // Pokaż wiadomość o sukcesie
    setShowSuccess(true);
    
    // Przekieruj do dashboardu po krótkim opóźnieniu
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div style={styles.container}>
      <div style={styles.logoContainer}>
        <img 
          src="/logo.svg" 
          alt="HealthyMeal Logo" 
          style={styles.logo} 
          onError={(e) => {
            // Fallback jeśli logo nie istnieje
            e.target.src = 'https://via.placeholder.com/150x60?text=HealthyMeal';
          }}
        />
      </div>
      
      <div style={styles.loginContainer}>
        {showSuccess && (
          <div style={styles.successMessage}>
            Zalogowano pomyślnie! Przekierowywanie...
          </div>
        )}
        
        <LoginForm onSuccess={handleLoginSuccess} />
        
        <div style={styles.bottomLinks}>
          Nie masz jeszcze konta?
          <Link to="/register" style={styles.link}>
            Zarejestruj się
          </Link>
        </div>
        
        <div style={styles.bottomLinks}>
          Zapomniałeś hasła?
          <Link to="/reset-password" style={styles.link}>
            Zresetuj hasło
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 