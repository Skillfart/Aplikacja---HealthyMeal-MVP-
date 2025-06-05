import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { useAuth } from '../../contexts/AuthContext';
import './RecipePrint.module.css';

const RecipePrint = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recipeHtml, setRecipeHtml] = useState('');
  const { getAccessToken, refreshToken } = useAuth();
  const navigate = useNavigate();
  
  // Funkcja pomocnicza do pobierania tokenu
  const getAuthConfig = () => {
    const token = getAccessToken();
    return token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
  };
  
  useEffect(() => {
    const fetchRecipeForPrint = async () => {
      if (!id) {
        setError('Brak identyfikatora przepisu');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const config = getAuthConfig();
        
        // Dodajemy nagłówek Accept dla typu HTML
        const configWithHtmlAccept = {
          ...config,
          headers: {
            ...config.headers,
            'Accept': 'text/html'
          },
          responseType: 'text'
        };
        
        const response = await axios.get(`/api/recipes/${id}/print?format=html`, configWithHtmlAccept);
        
        // W zależności od typu odpowiedzi obsługujemy różne formaty
        if (response.headers['content-type']?.includes('text/html')) {
          setRecipeHtml(response.data);
        } else {
          setError('Otrzymano nieoczekiwany format danych');
        }
        
        setLoading(false);
        
        // Automatycznie wywołaj funkcję drukowania po załadowaniu
        setTimeout(() => {
          window.print();
        }, 500);
        
      } catch (err) {
        console.error('Błąd podczas pobierania przepisu do druku:', err);
        
        // Sprawdź czy to błąd autoryzacji
        if (err.response && err.response.status === 401) {
          try {
            await refreshToken();
            const newConfig = getAuthConfig();
            const configWithHtmlAccept = {
              ...newConfig,
              headers: {
                ...newConfig.headers,
                'Accept': 'text/html'
              },
              responseType: 'text'
            };
            
            const response = await axios.get(`/api/recipes/${id}/print?format=html`, configWithHtmlAccept);
            
            if (response.headers['content-type']?.includes('text/html')) {
              setRecipeHtml(response.data);
              
              // Automatycznie wywołaj funkcję drukowania po załadowaniu
              setTimeout(() => {
                window.print();
              }, 500);
            }
          } catch (refreshErr) {
            setError('Problem z autoryzacją. Spróbuj zalogować się ponownie.');
          }
        } else {
          setError(err.response?.data?.message || 'Wystąpił błąd podczas pobierania przepisu');
        }
        setLoading(false);
      }
    };
    
    fetchRecipeForPrint();
  }, [id, getAccessToken, refreshToken]);
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleBack = () => {
    // Wróć do strony przepisu
    navigate(`/recipes/${id}`);
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Ładowanie...</span>
        </Spinner>
        <p>Przygotowywanie przepisu do druku...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <Alert variant="danger">
          {error}
        </Alert>
        <Button variant="secondary" onClick={handleBack}>
          Powrót do przepisu
        </Button>
      </div>
    );
  }
  
  return (
    <div className="print-container">
      <div className="print-actions no-print">
        <Button variant="primary" onClick={handlePrint}>
          Drukuj przepis
        </Button>
        <Button variant="secondary" onClick={handleBack}>
          Powrót do przepisu
        </Button>
      </div>
      
      {/* Renderuj HTML przepisu bezpośrednio */}
      <div 
        className="recipe-content"
        dangerouslySetInnerHTML={{ __html: recipeHtml }}
      />
    </div>
  );
};

export default RecipePrint; 