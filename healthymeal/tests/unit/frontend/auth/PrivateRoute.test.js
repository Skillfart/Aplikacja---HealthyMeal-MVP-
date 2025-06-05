import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PrivateRoute from '@frontend/components/routes/PrivateRoute';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from '@frontend/contexts/AuthContext';

// Mock funkcji useAuth
vi.mock('@frontend/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('PrivateRoute Component', () => {
  // Komponenty do testów
  const ProtectedComponent = () => <div>Chroniona zawartość</div>;
  const LoginComponent = () => <div>Strona logowania</div>;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('powinno renderować chronioną zawartość, gdy użytkownik jest zalogowany', () => {
    // Mockujemy stan autentykacji jako zalogowany
    useAuth.mockReturnValue({
      isAuthenticated: () => true,
      loading: false
    });
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={
            <PrivateRoute>
              <ProtectedComponent />
            </PrivateRoute>
          } />
          <Route path="/login" element={<LoginComponent />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Sprawdzamy czy chroniona zawartość jest widoczna
    expect(screen.getByText('Chroniona zawartość')).toBeInTheDocument();
  });
  
  it('powinno przekierować na stronę logowania, gdy użytkownik nie jest zalogowany', () => {
    // Mockujemy stan autentykacji jako niezalogowany
    useAuth.mockReturnValue({
      isAuthenticated: () => false,
      loading: false
    });
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={
            <PrivateRoute>
              <ProtectedComponent />
            </PrivateRoute>
          } />
          <Route path="/login" element={<LoginComponent />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Sprawdzamy czy nastąpiło przekierowanie na stronę logowania
    expect(screen.getByText('Strona logowania')).toBeInTheDocument();
    expect(screen.queryByText('Chroniona zawartość')).not.toBeInTheDocument();
  });
  
  it('powinno wyświetlać komponent ładowania, gdy trwa ładowanie stanu autentykacji', () => {
    // Mockujemy stan autentykacji jako ładowanie
    useAuth.mockReturnValue({
      isAuthenticated: () => false,
      loading: true
    });
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={
            <PrivateRoute>
              <ProtectedComponent />
            </PrivateRoute>
          } />
          <Route path="/login" element={<LoginComponent />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Sprawdzamy czy komponent ładowania jest widoczny
    expect(screen.getByText(/ładowanie/i)).toBeInTheDocument();
    expect(screen.queryByText('Chroniona zawartość')).not.toBeInTheDocument();
    expect(screen.queryByText('Strona logowania')).not.toBeInTheDocument();
  });
  
  it('powinno zachować oryginalny adres URL w parametrze redirectTo przy przekierowaniu', () => {
    // Mockujemy lokalizację i nawigację
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: '/protected' })
      };
    });
    
    // Mockujemy stan autentykacji jako niezalogowany
    useAuth.mockReturnValue({
      isAuthenticated: () => false,
      loading: false
    });
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={
            <PrivateRoute>
              <ProtectedComponent />
            </PrivateRoute>
          } />
          <Route path="/login" element={<LoginComponent />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Sprawdzamy czy nawigacja została wywołana z odpowiednim parametrem
    expect(mockNavigate).toHaveBeenCalledWith('/login?redirectTo=/protected', expect.anything());
  });
}); 