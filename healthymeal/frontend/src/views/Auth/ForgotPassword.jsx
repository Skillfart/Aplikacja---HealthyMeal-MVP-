import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import styles from './Auth.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      
      toast.success('Instrukcje resetowania hasła zostały wysłane na podany adres email.');
      setEmail('');
    } catch (error) {
      console.error('Błąd resetowania hasła:', error);
      toast.error(error.message || 'Wystąpił błąd podczas resetowania hasła');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authBox}>
        <h2>Resetowanie hasła</h2>
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <button 
            type="submit" 
            className={styles.button}
            disabled={loading}
          >
            {loading ? 'Wysyłanie...' : 'Wyślij instrukcje'}
          </button>
        </form>
        <div className={styles.authLinks}>
          <Link to="/login">Powrót do logowania</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 