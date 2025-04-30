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
  loading: {
    textAlign: 'center' as const,
    color: '#666',
  },
};

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Resetuj poprzednie błędy
    setError(null);
    
    // Podstawowa walidacja
    if (!email) {
      setError('Podaj adres email');
      return;
    }
    
    if (!password) {
      setError('Podaj hasło');
      return;
    }
    
    try {
      setLoading(true);
      
      // Logowanie za pomocą Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
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
        console.error('Błąd logowania:', signInError);
        return;
      }
      
      if (data?.session) {
        // Pomyślne logowanie
        console.log('Zalogowano pomyślnie!');
        
        // Wywołaj callback w przypadku powodzenia
        if (onSuccess) {
          onSuccess();
        } else {
          // Przekieruj do dashboardu
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Nieoczekiwany błąd podczas logowania:', err);
      setError('Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <h2 style={styles.title}>Logowanie</h2>
      
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
        
        <div style={styles.formGroup}>
          <label htmlFor="password" style={styles.label}>
            Hasło
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Wprowadź hasło"
            style={styles.input}
            disabled={loading}
            autoComplete="current-password"
          />
        </div>
        
        <button 
          type="submit" 
          style={styles.button} 
          disabled={loading}
        >
          {loading ? 'Logowanie...' : 'Zaloguj się'}
        </button>
        
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginForm; 