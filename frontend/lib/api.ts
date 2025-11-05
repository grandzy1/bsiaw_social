const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Typy danych
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  user: User;
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

export interface Profile {
  id: number;
  username: string;
  email: string;
  bio: string;
  avatar: string | null;
  created_at: string;
}

// CSRF Token management
let csrfToken: string | null = null;

async function getCSRFToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  
  const response = await fetch(`${API_BASE_URL}/auth/csrf/`, {
    credentials: 'include',
  });
  
  // Pobierz token z cookie
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrftoken') {
      csrfToken = value;
      return value;
    }
  }
  
  return '';
}

// Helper do tworzenia headerów
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
      credentials: 'include', // Wyślij cookies
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
  // Pierwszy request
  let response = await fetch(url, {
    ...options,
    credentials: 'include', // WAŻNE: zawsze wysyłaj cookies
  });
  
  // Jeśli 401 (unauthorized), spróbuj odświeżyć token
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    
    if (refreshed) {
      // Ponów request z nowym tokenem
      response = await fetch(url, {
        ...options,
        credentials: 'include',
      });
    }
  }
  
  return response;
}

// API Client
export const api = {
  // Autentykacja
  auth: {
    async register(username: string, email: string, password: string): Promise<AuthResponse> {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: await getHeaders(),
        credentials: 'include', // WAŻNE: odbierz cookies
        body: JSON.stringify({ username, email, password, password2: password }),
      });
      return handleResponse<AuthResponse>(response);
    },

    async login(username: string, password: string): Promise<AuthResponse> {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: await getHeaders(),
        credentials: 'include', // WAŻNE: odbierz cookies
        body: JSON.stringify({ username, password }),
      });
      return handleResponse<AuthResponse>(response);
    },

    async logout(): Promise<void> {
      await authenticatedFetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        headers: await getHeaders(),
      });
      csrfToken = null; // Reset CSRF token
    },

    async getCurrentUser(): Promise<User> {
      const response = await authenticatedFetch(`${API_BASE_URL}/auth/user/`, {
        headers: await getHeaders(false),
      });
      return handleResponse<User>(response);
    },

    async refreshToken(): Promise<boolean> {
      return refreshAccessToken();
    },

    // Sprawdź czy użytkownik jest zalogowany (spróbuj pobrać dane)
    async isAuthenticated(): Promise<boolean> {
      try {
        await this.getCurrentUser();
        return true;
      } catch {
        return false;
      }
    },
  },

  // Posty
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

  // Komentarze
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

  // Profile
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