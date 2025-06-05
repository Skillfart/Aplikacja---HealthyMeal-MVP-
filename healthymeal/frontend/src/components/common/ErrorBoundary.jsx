import React, { Component } from 'react';
import { Alert, Button, Card } from 'react-bootstrap';
import './ErrorBoundary.css';

/**
 * Komponent obsługujący błędy renderowania w aplikacji
 * Przechwytuje błędy w komponentach potomnych i wyświetla przyjazny komunikat błędu
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      expanded: false
    };
  }

  // Aktualizacja stanu, gdy wystąpi błąd
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // Przechwycenie szczegółów błędu
  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Możesz tutaj dodać logowanie błędu do serwera
    console.error("Błąd renderowania:", error, errorInfo);
  }

  // Obsługa przycisku trybu dewelopera
  toggleExpand = () => {
    this.setState(prevState => ({
      expanded: !prevState.expanded
    }));
  }

  // Obsługa przycisku odświeżenia
  handleRefresh = () => {
    window.location.reload();
  }

  // Obsługa przycisku powrotu
  handleGoBack = () => {
    window.history.back();
  }

  render() {
    // Jeśli nie ma błędu, renderuj normalnie komponenty dzieci
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Jeśli wystąpił błąd, wyświetl komunikat błędu
    return (
      <div className="error-boundary-container">
        <Card className="error-boundary-card">
          <Card.Header className="error-boundary-header">
            <h4>Coś poszło nie tak</h4>
          </Card.Header>
          <Card.Body>
            <Alert variant="danger">
              <p>Wystąpił nieoczekiwany błąd podczas ładowania tej części aplikacji.</p>
              <p>Możesz spróbować odświeżyć stronę lub wrócić do poprzedniego widoku.</p>
            </Alert>
            
            <div className="error-boundary-actions">
              <Button variant="outline-primary" onClick={this.handleGoBack}>
                Wróć
              </Button>
              <Button variant="primary" onClick={this.handleRefresh}>
                Odśwież stronę
              </Button>
            </div>
            
            {process.env.NODE_ENV !== 'production' && (
              <div className="error-boundary-details">
                <Button 
                  variant="link" 
                  className="error-boundary-toggle" 
                  onClick={this.toggleExpand}
                >
                  {this.state.expanded ? 'Ukryj szczegóły błędu' : 'Pokaż szczegóły błędu (tryb deweloperski)'}
                </Button>
                
                {this.state.expanded && this.state.error && (
                  <div className="error-boundary-tech-details">
                    <h5>Szczegóły techniczne:</h5>
                    <p className="error-boundary-message">{this.state.error.toString()}</p>
                    {this.state.errorInfo && (
                      <pre className="error-boundary-stack">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    );
  }
}

export default ErrorBoundary; 