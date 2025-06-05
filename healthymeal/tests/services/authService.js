// Usługi autoryzacji dla testów
import { validatePassword, validateEmail } from '../utils/security';

// Przechowywanie "bazy danych" w pamięci dla testów
const users = new Map();
const sessions = new Map();
const loginAttempts = new Map();
const verifiedEmails = new Set();

// Funkcja do rejestracji użytkownika
export async function signUp(userData) {
  const { email, password, name } = userData;
  
  // Walidacja emaila
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return {
      success: false,
      error: emailValidation.errors.join(', ')
    };
  }
  
  // Walidacja hasła
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return {
      success: false,
      error: 'Hasło nie spełnia wymagań bezpieczeństwa: ' + passwordValidation.errors.join(', ')
    };
  }
  
  // Sprawdzenie czy użytkownik już istnieje
  if (users.has(email)) {
    return {
      success: false,
      error: 'Użytkownik z tym adresem email już istnieje'
    };
  }
  
  // Sanityzacja danych
  const sanitizedName = sanitizeInput(name);
  
  // Utworzenie nowego użytkownika
  const newUser = {
    id: `user_${Date.now()}`,
    email,
    password, // W prawdziwej aplikacji hasło byłoby zahashowane
    name: sanitizedName,
    createdAt: new Date(),
    permissions: ['user']
  };
  
  // Zapisanie użytkownika
  users.set(email, newUser);
  
  return {
    success: true,
    requiresEmailVerification: true,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name
    }
  };
}

// Funkcja do logowania użytkownika
export async function signIn(email, password) {
  // Sprawdzenie czy użytkownik istnieje
  if (!users.has(email)) {
    return {
      success: false,
      error: 'Nieprawidłowy email lub hasło'
    };
  }
  
  // Sprawdzenie czy użytkownik nie jest zablokowany
  const attempts = loginAttempts.get(email) || 0;
  if (attempts >= 5) {
    return {
      success: false,
      error: 'Zbyt wiele nieudanych prób logowania. Konto zostało tymczasowo zablokowane.'
    };
  }
  
  // Sprawdzenie hasła
  const user = users.get(email);
  if (user.password !== password) {
    // Zwiększenie licznika nieudanych prób
    loginAttempts.set(email, (loginAttempts.get(email) || 0) + 1);
    
    return {
      success: false,
      error: 'Nieprawidłowy email lub hasło'
    };
  }
  
  // Resetowanie licznika nieudanych prób
  loginAttempts.set(email, 0);
  
  // Sprawdzenie czy email został potwierdzony
  if (!verifiedEmails.has(email)) {
    return {
      success: false,
      error: 'Email nie został potwierdzony'
    };
  }
  
  // Generowanie tokenu
  const token = generateToken(user);
  
  // Zapisanie sesji
  sessions.set(token, {
    userId: user.id,
    email: user.email,
    createdAt: new Date(),
    isValid: true
  });
  
  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  };
}

// Funkcja do wylogowania użytkownika
export async function signOut(token) {
  if (sessions.has(token)) {
    // Unieważnienie sesji
    const session = sessions.get(token);
    session.isValid = false;
    sessions.set(token, session);
  }
  
  return {
    success: true
  };
}

// Funkcja do pobierania aktualnego użytkownika
export async function getCurrentUser(token) {
  // Sprawdzenie czy sesja istnieje
  if (!sessions.has(token)) {
    return {
      success: false,
      error: 'Token nieprawidłowy'
    };
  }
  
  // Sprawdzenie czy sesja jest ważna
  const session = sessions.get(token);
  if (!session.isValid) {
    return {
      success: false,
      error: 'Token unieważniony'
    };
  }
  
  // Sprawdzenie czasu sesji (24h)
  const sessionAge = Date.now() - session.createdAt.getTime();
  if (sessionAge > 24 * 60 * 60 * 1000) {
    return {
      success: false,
      error: 'Sesja wygasła'
    };
  }
  
  // Pobieranie użytkownika
  const user = [...users.values()].find(u => u.id === session.userId);
  if (!user) {
    return {
      success: false,
      error: 'Użytkownik nie istnieje'
    };
  }
  
  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      permissions: user.permissions
    }
  };
}

// Funkcja do zmiany hasła
export async function changePassword(oldPassword, newPassword) {
  // Implementacja zmiany hasła
  // Unieważnienie wszystkich sesji użytkownika
  [...sessions.entries()].forEach(([token, session]) => {
    session.isValid = false;
    sessions.set(token, session);
  });
  
  return {
    success: true
  };
}

// Funkcja do aktualizacji uprawnień użytkownika
export async function updateUserPermissions(email, permissions) {
  if (users.has(email)) {
    const user = users.get(email);
    user.permissions = permissions;
    users.set(email, user);
    
    // Unieważnienie wszystkich sesji użytkownika
    [...sessions.entries()].forEach(([token, session]) => {
      if (session.email === email) {
        session.isValid = false;
        sessions.set(token, session);
      }
    });
  }
  
  return {
    success: true
  };
}

// Pomocnicze funkcje
function generateToken(user) {
  return `mock_token_${user.id}_${Date.now()}`;
}

function sanitizeInput(input) {
  if (!input) return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
} 