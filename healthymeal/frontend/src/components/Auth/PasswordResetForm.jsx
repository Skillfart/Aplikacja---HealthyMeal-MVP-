import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

// Style komponentu
const styles = {
  formContainer: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '24px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 500,
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    transition: 'border-color 0.3s',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  error: {
    color: '#f44336',
    marginTop: '16px',
    padding: '8px',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
  },
  success: {
    color: '#4CAF50',
    marginTop: '16px',
    padding: '8px',
    backgroundColor: '#e8f5e9',
    borderRadius: '4px',
  },
  loading: {
    textAlign: 'center',
    color: '#666',
  },
  infoText: {
    fontSize: '14px',
    color: '#666',
    marginTop: '8px',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#2196F3',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '0',
    marginTop: '16px',
    display: 'block',
    width: '100%',
    textAlign: 'center',
  },
};

/**
 * Komponent formularza resetowania hasła
 * Umożliwia użytkownikowi zresetowanie hasła przez podanie adresu email
 * 
 * @param {object} props - Właściwości komponentu
 * @param {Function} props.onSuccess - Callback wywoływany po pomyślnym zresetowaniu hasła
 * @returns {React.ReactElement} Komponent formularza resetowania hasła
 */
const PasswordResetForm = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  // Używamy resetPassword z kontekstu Auth (można użyć też alias resetPassword)
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Resetuj poprzednie błędy i sukces
    setError(null);
    setSuccess(null);
    
    // Podstawowa walidacja
    if (!email) {
      setError('Podaj adres email');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Podaj poprawny adres email');
      return;
    }
    
    try {
      setLoading(true);
      
      // Resetowanie hasła za pomocą kontekstu Auth
      const { error: resetError } = await resetPassword(email);
      
      if (resetError) {
        throw resetError;
      }
      
      // Pomyślne wysłanie linku resetującego
      setSuccess('Link do resetowania hasła został wysłany. Sprawdź swoją skrzynkę email.');
      
      // Wywołaj callback w przypadku powodzenia
      if (onSuccess) {
        setTimeout(() => onSuccess(), 3000);
      }
    } catch (err) {
      console.error('Błąd resetowania hasła:', err);
      
      if (err.message?.includes('Invalid email')) {
        setError('Podany adres email jest nieprawidłowy');
      } else if (err.message?.includes('User not found')) {
        setError('Nie znaleziono użytkownika z podanym adresem email');
      } else {
        setError(`Błąd resetowania hasła: ${err.message || 'Nieznany błąd'}`);
      }
      
      // Powiadomienie o błędzie (toast może być już wywołany w kontekście Auth)
      if (!toast.isActive('reset-error')) {
        toast.error(error, { toastId: 'reset-error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div style={styles.formContainer} data-testid="password-reset-form">
      <h2 style={styles.title}>Resetowanie hasła</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>
            Adres email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="twoj@email.com"
            style={styles.input}
            disabled={loading || !!success}
            autoComplete="email"
            data-testid="email-input"
          />
        </div>
        
        <p style={styles.infoText}>
          Podaj adres email powiązany z Twoim kontem. Wyślemy Ci link umożliwiający ustawienie nowego hasła.
        </p>
        
        <button 
          type="submit" 
          style={styles.button} 
          disabled={loading || !!success}
          data-testid="reset-button"
        >
          {loading ? 'Wysyłanie...' : 'Resetuj hasło'}
        </button>
        
        {error && (
          <div style={styles.error} data-testid="error-message">
            {error}
          </div>
        )}
        
        {success && (
          <div style={styles.success} data-testid="success-message">
            {success}
          </div>
        )}
        
        <button 
          type="button" 
          style={styles.linkButton}
          onClick={handleBackToLogin}
          data-testid="back-to-login"
        >
          Powrót do logowania
        </button>
      </form>
    </div>
  );
};

export default PasswordResetForm; 