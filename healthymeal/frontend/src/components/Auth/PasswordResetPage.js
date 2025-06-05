import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

/**
 * Komponent strony resetowania hasła
 * Umożliwia użytkownikowi zresetowanie hasła poprzez podanie adresu email
 * 
 * @returns {React.ReactElement} Formularz resetowania hasła
 */
const PasswordResetPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();

  /**
   * Obsługa resetowania hasła
   * @param {React.FormEvent} e - Wydarzenie submit formularza
   */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Podstawowa walidacja
    if (!email) {
      toast.error('Proszę podać adres email');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const { error } = await resetPassword(email);
      
      if (error) throw error;
      
      // Pokazanie komunikatu o sukcesie
      setIsSubmitted(true);
    } catch (error) {
      console.error('Błąd resetowania hasła:', error);
      // Toast pokazywany jest już w funkcji resetPassword w AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5" data-testid="password-reset-page">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Resetowanie hasła</h2>
              
              {isSubmitted ? (
                <div className="alert alert-success" data-testid="success-message">
                  <p className="mb-0">Na podany adres email wysłaliśmy link do resetowania hasła.</p>
                  <p className="mt-2 mb-0">Sprawdź swoją skrzynkę odbiorczą i kliknij w link, aby kontynuować.</p>
                </div>
              ) : (
                <form onSubmit={handleResetPassword}>
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
                    <div className="form-text">
                      Podaj adres email przypisany do Twojego konta, a my wyślemy Ci link do zresetowania hasła.
                    </div>
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
                          Wysyłanie...
                        </>
                      ) : 'Zresetuj hasło'}
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            <div className="card-footer text-center">
              <p className="mb-0">
                <Link to="/login" className="text-decoration-none">Powrót do logowania</Link>
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

export default PasswordResetPage; 