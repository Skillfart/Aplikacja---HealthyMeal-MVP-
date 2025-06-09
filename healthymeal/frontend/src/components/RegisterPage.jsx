import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Hasła nie są identyczne');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const { error } = await signUp(email, password);
      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      console.error('Błąd rejestracji:', error);
      setMessage(error.message || 'Wystąpił błąd podczas rejestracji');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>HealthyMeal</h1>
        <p>Utwórz nowe konto</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Twój adres email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Hasło</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Twoje hasło"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Potwierdź hasło</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Powtórz hasło"
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Rejestracja...' : 'Zarejestruj się'}
          </button>
          {message && (
            <div className={`message ${message.includes('błąd') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
          <p style={{ marginTop: '10px', textAlign: 'center' }}>
            Masz już konto? <a href="/login">Zaloguj się</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
