import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

/**
 * Komponent strony rejestracji
 * Umożliwia użytkownikowi założenie nowego konta
 * 
 * @returns {React.ReactElement} Formularz rejestracji
 */
const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  /**
   * Obsługa rejestracji
   * @param {React.FormEvent} e - Wydarzenie submit formularza
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Podstawowa walidacja
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Proszę uzupełnić wszystkie pola');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Hasła muszą być identyczne');
      return;
    }

    if (password.length < 8) {
      toast.error('Hasło musi mieć co najmniej 8 znaków');
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await register(email, password, name);
      
      if (error) throw error;
      
      // Przekierowanie do dashboardu po pomyślnej rejestracji
      navigate('/dashboard');
    } catch (error) {
      console.error('Błąd rejestracji:', error);
      // Toast pokazywany jest już w funkcji register w AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5" data-testid="register-page">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Rejestracja</h2>
              
              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Imię</label>
                  <input
                    id="name"
                    type="text"
                    className="form-control"
                    placeholder="Twoje imię"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    placeholder="Twój adres email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Hasło</label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    placeholder="Minimum 8 znaków"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Potwierdź hasło</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="form-control"
                    placeholder="Powtórz hasło"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="d-grid gap-2 mb-3">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Rejestracja...
                      </>
                    ) : 'Zarejestruj się'}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="card-footer text-center">
              <p className="mb-0">
                Masz już konto? <Link to="/login" className="text-decoration-none">Zaloguj się</Link>
              </p>
            </div>
          </div>
          
          <div className="text-center mt-3">
            <Link to="/" className="text-decoration-none">Powrót do strony głównej</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 