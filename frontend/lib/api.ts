'use client' 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// --- Typy Danych ---
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Profile {
  id: number;
  username: string;
  email: string;
  bio: string;
  avatar: string | null;
  created_at: string;
}

export interface AuthResponse {
  user: Profile;
  message: string;
  access?: string;
  refresh?: string;
}

export interface Post {
  id: number;
  author: User;
  author_username: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  can_delete: boolean;
}

export interface Comment {
  id: number;
  author: User;
  author_username: string;
  post: number;
  content: string;
  created_at: string;
}

// --- Obsługa Błędów ---
class APIError extends Error {
  constructor(public status: number, public data: any) {
    super(`API Error: ${status}`);
  }
}

// --- Zarządzanie Tokenami (localStorage) ---
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Sprawdzamy, czy jesteśmy w przeglądarce
const isBrowser = () => typeof window !== 'undefined';

const setTokens = (access: string, refresh: string) => {
  if (isBrowser()) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }
};

const getAccessToken = (): string | null => {
  return isBrowser() ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
};

const getRefreshToken = (): string | null => {
  return isBrowser() ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
};

const clearTokens = () => {
  if (isBrowser()) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

// --- CSRF (Nadal potrzebne dla POST/PUT/DELETE) ---
let csrfToken: string | null = null;
async function getCSRFToken(): Promise<string> {
  // Jeśli już pobraliśmy token, użyj go ponownie
  if (csrfToken && isBrowser() && document.cookie.includes('csrftoken')) {
    return csrfToken;
  }
  
  try {
    // Używamy fetch, a nie authenticatedFetch, aby uniknąć pętli
    await fetch(`${API_BASE_URL}/auth/csrf/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit', // Nie wysyłaj tokenów auth po ten token
    });
    
    // Odczytujemy cookie
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken') {
        csrfToken = value;
        return value;
      }
    }
  } catch (error) {
    console.error('Nie udało się pobrać tokenu CSRF', error);
  }
  return '';
}

// --- Główny Wrapper `fetch` ---

// Zmienna do śledzenia, czy odświeżanie jest w toku
let isRefreshing = false;

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return {} as T;
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(response.status, errorData);
  }
  return response.json();
}

async function authenticatedFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  
  // 1. Przygotuj nagłówki
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  // Dołącz CSRF dla metod modyfikujących dane
  const method = options.method?.toUpperCase() || 'GET';
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const token = await getCSRFToken();
    if (token) {
      headers.set('X-CSRFToken', token);
    }
  }
  
  // Dołącz token dostępu
  const accessToken = getAccessToken();
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // 2. Wykonaj żądanie
  let response = await fetch(url, { ...options, headers });

  // 3. Obsługa 401 (Token wygasł)
  if (response.status === 401 && !isRefreshing) {
    isRefreshing = true;
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearTokens();
      // Tylko przekieruj, jeśli to nie jest próba logowania
      if (!url.includes('/api/auth/login')) {
         window.location.href = '/login';
      }
      throw new APIError(401, { detail: 'Brak refresh tokena.' });
    }

    try {
      // 4. Spróbuj odświeżyć token
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Odświeżenie tokena nie powiodło się');
      }

      const { access: newAccessToken } = await refreshResponse.json();
      localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
      
      // 5. Ponów pierwotne żądanie z nowym tokenem
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      response = await fetch(url, { ...options, headers });

    } catch (refreshError) {
      // 6. Odświeżenie się nie powiodło (np. refresh token też wygasł)
      clearTokens();
      window.location.href = '/login'; // Wymuś wylogowanie
      throw new APIError(401, { detail: 'Sesja wygasła.' });
    } finally {
      isRefreshing = false;
    }
  }

  return response;
}

// --- API Client ---
export const api = {
  auth: {
    async register(username: string, email: string, password: string): Promise<AuthResponse> {
      // POPRAWKA: Używamy zwykłego 'fetch' i ręcznie budujemy nagłówki
      const csrf = await getCSRFToken();
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrf
        },
        body: JSON.stringify({ username, email, password, password2: password }),
      });
      const data = await handleResponse<AuthResponse>(response);
      
      // Zapisz tokeny, jeśli istnieją
      if (data.access && data.refresh) {
        setTokens(data.access, data.refresh);
      }
      return data;
    },

    async login(username: string, password: string): Promise<AuthResponse> {
      // POPRAWKA: Używamy zwykłego 'fetch' i ręcznie budujemy nagłówki
      const csrf = await getCSRFToken();
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrf
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await handleResponse<AuthResponse>(response);
      
      // Zapisz tokeny, jeśli istnieją
      if (data.access && data.refresh) {
        setTokens(data.access, data.refresh);
      }
      return data;
    },

    async logout(): Promise<void> {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          // Wyślij token do blacklisty (użyj authenticatedFetch, on ma logikę CSRF)
          await authenticatedFetch(`${API_BASE_URL}/auth/logout/`, {
            method: 'POST',
            body: JSON.stringify({ refresh: refreshToken }),
          });
        } catch (error) {
          console.error("Błąd podczas wylogowania na backendzie", error);
        }
      }
      // Zawsze czyść tokeny na frontendzie
      clearTokens();
      csrfToken = null;
    },

    async getCurrentUser(): Promise<Profile> {
      const response = await authenticatedFetch(`${API_BASE_URL}/auth/user/`);
      return handleResponse<Profile>(response);
    },
  },

  posts: {
    async list(page: number = 1): Promise<{ results: Post[]; count: number; next: string | null; previous: string | null }> {
      const response = await authenticatedFetch(`${API_BASE_URL}/posts/?page=${page}`);
      return handleResponse(response);
    },

    async create(content: string): Promise<Post> {
      const response = await authenticatedFetch(`${API_BASE_URL}/posts/`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      return handleResponse<Post>(response);
    },

    async get(id: number): Promise<Post> {
      const response = await authenticatedFetch(`${API_BASE_URL}/posts/${id}/`);
      return handleResponse<Post>(response);
    },

    async delete(id: number): Promise<void> {
      const response = await authenticatedFetch(`${API_BASE_URL}/posts/${id}/`, {
        method: 'DELETE',
      });
      await handleResponse(response);
    },

    async like(id: number): Promise<Post> {
      const response = await authenticatedFetch(`${API_BASE_URL}/posts/${id}/like/`, {
        method: 'POST',
      });
      return handleResponse<Post>(response);
    },

    async unlike(id: number): Promise<Post> {
      const response = await authenticatedFetch(`${API_BASE_URL}/posts/${id}/unlike/`, {
        method: 'POST',
      });
      return handleResponse<Post>(response);
    },
  },

  comments: {
    async list(postId: number): Promise<Comment[]> {
      const response = await authenticatedFetch(`${API_BASE_URL}/comments/?post_id=${postId}`);
      const data = await handleResponse<{ results: Comment[] }>(response);
      return data.results;
    },

    async create(postId: number, content: string): Promise<Comment> {
      const response = await authenticatedFetch(`${API_BASE_URL}/comments/`, {
        method: 'POST',
        body: JSON.stringify({ post: postId, content }),
      });
      return handleResponse<Comment>(response);
    },
    
    async delete(id: number): Promise<void> {
      const response = await authenticatedFetch(`${API_BASE_URL}/comments/${id}/`, {
        method: 'DELETE',
      });
      await handleResponse(response); 
    },
  },

  profiles: {
    async get(id: number): Promise<Profile> {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/profiles/${id}/`,
      );
      return handleResponse<Profile>(response);
    },

    async update(id: number, data: Partial<Profile>): Promise<Profile> {
      const response = await authenticatedFetch(`${API_BASE_URL}/profiles/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return handleResponse<Profile>(response);
    },
  },
};