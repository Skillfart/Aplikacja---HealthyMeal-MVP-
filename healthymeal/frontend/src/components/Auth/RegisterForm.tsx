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

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    // Resetuj poprzednie błędy
    setError(null);
    
    // Walidacja danych
    if (!name.trim()) {
      setError('Podaj swoje imię');
      return false;
    }
    
    if (!email.trim()) {
      setError('Podaj adres email');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Podaj poprawny adres email');
      return false;
    }
    
    if (!password) {
      setError('Podaj hasło');
      return false;
    }
    
    if (password.length < 6) {
      setError('Hasło musi zawierać co najmniej 6 znaków');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne');
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
      
      // Rejestracja za pomocą Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          // Przekierowanie po potwierdzeniu email
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      
      if (signUpError) {
        // Obsługa błędów rejestracji
        switch (signUpError.message) {
          case 'User already registered':
            setError('Użytkownik o tym adresie email już istnieje');
            break;
          case 'Password should be at least 6 characters':
            setError('Hasło musi zawierać co najmniej 6 znaków');
            break;
          default:
            setError(`Błąd rejestracji: ${signUpError.message}`);
            break;
        }
        console.error('Błąd rejestracji:', signUpError);
        return;
      }
      
      if (data) {
        // Pomyślna rejestracja
        setSuccess('Rejestracja zakończona pomyślnie! Sprawdź swoją skrzynkę email, aby potwierdzić konto.');
        
        // Resetowanie formularza
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        // Wywołaj callback w przypadku powodzenia
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            // Przekieruj do strony logowania po krótkim opóźnieniu
            navigate('/login');
          }
        }, 3000);
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas rejestracji:', err);
      setError('Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <h2 style={styles.title}>Rejestracja</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="name" style={styles.label}>
            Imię
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Twoje imię"
            style={styles.input}
            disabled={loading}
            autoComplete="name"
          />
        </div>
        
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
        
        <div style={styles.formGroup}>
          <label htmlFor="password" style={styles.label}>
            Hasło
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 znaków"
            style={styles.input}
            disabled={loading}
            autoComplete="new-password"
          />
        </div>
        
        <div style={styles.formGroup}>
          <label htmlFor="confirmPassword" style={styles.label}>
            Potwierdź hasło
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Powtórz hasło"
            style={styles.input}
            disabled={loading}
            autoComplete="new-password"
          />
        </div>
        
        <p style={styles.infoText}>
          Po rejestracji otrzymasz email z linkiem aktywacyjnym.
          Kliknij go, aby aktywować swoje konto.
        </p>
        
        <button 
          type="submit" 
          style={styles.button} 
          disabled={loading}
        >
          {loading ? 'Rejestracja...' : 'Zarejestruj się'}
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

export default RegisterForm; 