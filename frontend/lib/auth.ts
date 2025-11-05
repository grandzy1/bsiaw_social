// Zarządzanie autentykacją JWT
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface User {
  id: number;
  username: string;
}

// Zapisz tokeny w localStorage
export function setTokens(tokens: AuthTokens) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }
}

// Pobierz access token
export function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

// Pobierz refresh token
export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refresh_token');
  }
  return null;
}

// Usuń tokeny (logout)
export function clearTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

// Sprawdź czy użytkownik jest zalogowany
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

// Odśwież token
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', data.access);
    }
    return data.access;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    clearTokens();
    return null;
  }
}

// Logowanie
export async function login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const error = await res.json();
      return { success: false, error: error.detail || 'Login failed' };
    }

    const tokens: AuthTokens = await res.json();
    setTokens(tokens);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Rejestracja
export async function register(data: RegisterData): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/users/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      return { 
        success: false, 
        error: error.username?.[0] || error.password?.[0] || 'Registration failed' 
      };
    }

    // Po udanej rejestracji automatycznie zaloguj
    return await login(data);
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// Wylogowanie
export function logout() {
  clearTokens();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}