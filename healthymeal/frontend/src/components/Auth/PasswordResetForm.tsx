import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

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
    textAlign: 'center' as const,
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
    textAlign: 'center' as const,
    color: '#666',
  },
  infoText: {
    fontSize: '14px',
    color: '#666',
    marginTop: '8px',
  },
};

interface PasswordResetFormProps {
  onSuccess?: () => void;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    // Resetuj poprzednie błędy
    setError(null);
    
    // Walidacja danych
    if (!email.trim()) {
      setError('Podaj adres email');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Podaj poprawny adres email');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Walidacja formularza
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Resetowanie hasła za pomocą Supabase Auth
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      
      if (resetError) {
        // Obsługa błędów resetowania hasła
        switch (resetError.message) {
          case 'Email not found':
            setError('Nie znaleziono użytkownika o podanym adresie email');
            break;
          default:
            setError(`Błąd resetowania hasła: ${resetError.message}`);
            break;
        }
        console.error('Błąd resetowania hasła:', resetError);
        return;
      }
      
      // Pomyślne wysłanie linku do resetowania hasła
      setSuccess('Link do resetowania hasła został wysłany na podany adres email. Sprawdź swoją skrzynkę odbiorczą.');
      
      // Resetowanie formularza
      setEmail('');
      
      // Wywołaj callback w przypadku powodzenia
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          // Przekieruj do strony logowania po krótkim opóźnieniu
          navigate('/login');
        }
      }, 5000);
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas resetowania hasła:', err);
      setError('Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
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
            disabled={loading}
            autoComplete="email"
          />
        </div>
        
        <p style={styles.infoText}>
          Na podany adres email zostanie wysłany link do resetowania hasła.
          Kliknij go, aby ustawić nowe hasło.
        </p>
        
        <button 
          type="submit" 
          style={styles.button} 
          disabled={loading}
        >
          {loading ? 'Wysyłanie...' : 'Resetuj hasło'}
        </button>
        
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={styles.success}>
            {success}
          </div>
        )}
      </form>
    </div>
  );
};

export default PasswordResetForm; 