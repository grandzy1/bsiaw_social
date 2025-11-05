const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Typy danych
export interface User {
  id: number;
  username: string;
  email: string;
}

// POPRAWKA: Ten interfejs jest teraz głównym obiektem użytkownika po zalogowaniu
export interface Profile {
  id: number;
  username: string;
  email: string;
  bio: string;
  avatar: string | null;
  created_at: string;
}

export interface AuthResponse {
  user: Profile; // ZMIANA: Oczekujemy pełnego profilu
  message: string;
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

// Zarządzanie tokenem CSRF
let csrfToken: string | null = null;

async function getCSRFToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/csrf/`, {
      credentials: 'include',
    });
    
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

// Helper do tworzenia nagłówków
async function getHeaders(includeCSRF: boolean = true): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeCSRF) {
    const token = await getCSRFToken();
    if (token) {
      headers['X-CSRFToken'] = token;
    }
  }

  return headers;
}

// Obsługa błędów API
class APIError extends Error {
  constructor(public status: number, public data: any) {
    super(`API Error: ${status}`);
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    // No Content
    return {} as T;
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(response.status, errorData);
  }
  return response.json();
}

// Automatyczne odświeżanie tokenu
async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      credentials: 'include',
      headers: await getHeaders(),
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Wrapper dla fetch z automatycznym odświeżaniem
async function authenticatedFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  let response = await fetch(url, {
    ...options,
    credentials: 'include',
  });
  
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    
    if (refreshed) {
      response = await fetch(url, {
        ...options,
        credentials: 'include',
      });
    } else {
      // Jeśli odświeżenie się nie powiodło, wyloguj
      api.auth.logout();
      // Rzuć błąd, aby przerwać dalsze wykonywanie
      throw new APIError(401, { detail: 'Sesja wygasła, zaloguj się ponownie.' });
    }
  }
  
  return response;
}

// API Client
export const api = {
  auth: {
    async register(username: string, email: string, password: string): Promise<AuthResponse> {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: await getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ username, email, password, password2: password }),
      });
      return handleResponse<AuthResponse>(response);
    },

    async login(username: string, password: string): Promise<AuthResponse> {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: await getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      return handleResponse<AuthResponse>(response);
    },

    async logout(): Promise<void> {
      try {
        await authenticatedFetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: await getHeaders(),
        });
      } catch (error) {
        // Ignoruj błąd 401 przy wylogowywaniu
        if (error instanceof APIError && error.status === 401) {
           // Użytkownik i tak był już wylogowany
        } else {
          console.error('Błąd podczas wylogowania', error);
        }
      }
      csrfToken = null;
    },

    async getCurrentUser(): Promise<Profile> { // ZMIANA: Zwraca Profile
      const response = await authenticatedFetch(`${API_BASE_URL}/auth/user/`, {
        headers: await getHeaders(false),
      });
      return handleResponse<Profile>(response); // ZMIANA: Oczekuje Profile
    },

    async refreshToken(): Promise<boolean> {
      return refreshAccessToken();
    },

    isAuthenticated(): boolean {
      // Szybsze sprawdzenie - zakładamy, że jeśli jest cookie, to jest zalogowany
      // Pełna weryfikacja nastąpi przy pierwszym wywołaniu authenticatedFetch
      if (typeof window === 'undefined') return false;
      return document.cookie.includes('access_token');
    },
  },

  posts: {
    async list(page: number = 1): Promise<{ results: Post[]; count: number; next: string | null; previous: string | null }> {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/posts/?page=${page}`,
        { headers: await getHeaders(false) }
      );
      return handleResponse(response);
    },

    async create(content: string): Promise<Post> {
      const response = await authenticatedFetch(`${API_BASE_URL}/posts/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ content }),
      });
      return handleResponse<Post>(response);
    },

    async get(id: number): Promise<Post> {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/posts/${id}/`,
        { headers: await getHeaders(false) }
      );
      return handleResponse<Post>(response);
    },

    async delete(id: number): Promise<void> {
      await authenticatedFetch(`${API_BASE_URL}/posts/${id}/`, {
        method: 'DELETE',
        headers: await getHeaders(),
      });
    },

    async like(id: number): Promise<void> {
      await authenticatedFetch(`${API_BASE_URL}/posts/${id}/like/`, {
        method: 'POST',
        headers: await getHeaders(),
      });
    },

    async unlike(id: number): Promise<void> {
      await authenticatedFetch(`${API_BASE_URL}/posts/${id}/unlike/`, {
        method: 'POST',
        headers: await getHeaders(),
      });
    },

    async getUserPosts(username: string): Promise<Post[]> {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/posts/user_posts/?username=${username}`,
        { headers: await getHeaders(false) }
      );
      const data = await handleResponse<{ results: Post[] }>(response);
      return data.results;
    },
  },

  comments: {
    async list(postId: number): Promise<Comment[]> {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/comments/?post_id=${postId}`,
        { headers: await getHeaders(false) }
      );
      const data = await handleResponse<{ results: Comment[] }>(response);
      return data.results;
    },

    async create(postId: number, content: string): Promise<Comment> {
      const response = await authenticatedFetch(`${API_BASE_URL}/comments/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ post: postId, content }),
      });
      return handleResponse<Comment>(response);
    },

    async delete(id: number): Promise<void> {
      await authenticatedFetch(`${API_BASE_URL}/comments/${id}/`, {
        method: 'DELETE',
        headers: await getHeaders(),
      });
    },
  },

  profiles: {
    async get(id: number): Promise<Profile> {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/profiles/${id}/`,
        { headers: await getHeaders(false) }
      );
      return handleResponse<Profile>(response);
    },

    async update(id: number, data: Partial<Profile>): Promise<Profile> {
      const response = await authenticatedFetch(`${API_BASE_URL}/profiles/${id}/`, {
        method: 'PATCH',
        headers: await getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<Profile>(response);
    },
  },
};