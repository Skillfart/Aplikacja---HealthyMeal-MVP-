import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Feedback.module.css';

export const Feedback = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'bug',
    subject: '',
    description: '',
    screenshot: null
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        screenshot: e.target.files[0]
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      // Tworzenie formularza do wysłania (z obsługą plików)
      const formPayload = new FormData();
      formPayload.append('type', formData.type);
      formPayload.append('subject', formData.subject);
      formPayload.append('description', formData.description);
      
      if (formData.screenshot) {
        formPayload.append('screenshot', formData.screenshot);
      }
      
      await axios.post('/api/feedback', formPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(true);
      // Resetowanie formularza
      setFormData({
        type: 'bug',
        subject: '',
        description: '',
        screenshot: null
      });
      
      // Po 3 sekundach przekieruj do dashboardu
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Wystąpił błąd podczas wysyłania zgłoszenia. Spróbuj ponownie później.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className={styles.feedbackContainer}>
      <h2>Zgłoś problem lub opinię</h2>
      
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>
        Twoje zgłoszenie zostało wysłane! Dziękujemy za pomoc w ulepszaniu aplikacji.
        <br />
        Za chwilę nastąpi przekierowanie do strony głównej.
      </div>}
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="type">Typ zgłoszenia:</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="bug">Błąd w aplikacji</option>
            <option value="feature">Sugestia nowej funkcji</option>
            <option value="improvement">Propozycja ulepszenia</option>
            <option value="other">Inne</option>
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="subject">Temat:</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Krótki opis zgłoszenia"
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="description">Szczegółowy opis:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={6}
            placeholder="Opisz szczegółowo problem lub sugestię..."
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="screenshot">Zrzut ekranu (opcjonalnie):</label>
          <input
            type="file"
            id="screenshot"
            name="screenshot"
            onChange={handleFileChange}
            accept="image/*"
          />
          <p className={styles.fileHelp}>
            Możesz załączyć zrzut ekranu pokazujący problem (max 5MB, formaty: PNG, JPG)
          </p>
        </div>
        
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className={styles.cancelButton}
            disabled={submitting}
          >
            Anuluj
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting}
          >
            {submitting ? 'Wysyłanie...' : 'Wyślij zgłoszenie'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Feedback; 