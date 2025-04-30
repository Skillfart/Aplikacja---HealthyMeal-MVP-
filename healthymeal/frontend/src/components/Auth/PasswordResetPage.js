import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordResetForm from './PasswordResetForm';
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
  formContainer: {
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

const PasswordResetPage = () => {
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

  // Jeśli użytkownik jest już zalogowany, nie pokazuj strony resetowania hasła
  if (isAuthenticated) {
    return null; // lub możesz pokazać komunikat o przekierowaniu
  }

  const handleResetSuccess = () => {
    // Pokaż wiadomość o sukcesie
    setShowSuccess(true);
    
    // Przekieruj do strony logowania po krótkim opóźnieniu
    setTimeout(() => {
      navigate('/login');
    }, 5000);
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
      
      <div style={styles.formContainer}>
        {showSuccess && (
          <div style={styles.successMessage}>
            Link do resetowania hasła został wysłany! Sprawdź swoją skrzynkę email.
          </div>
        )}
        
        <PasswordResetForm onSuccess={handleResetSuccess} />
        
        <div style={styles.bottomLinks}>
          <Link to="/login" style={styles.link}>
            Powrót do logowania
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage; 