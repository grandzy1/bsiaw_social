import { Post } from '../types/post';
import { getAccessToken, refreshAccessToken, clearTokens } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Uniwersalna funkcja do wykonywania requestów z JWT
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  let token = getAccessToken();

  // Dodaj token do headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  let response = await fetch(url, { ...options, headers });

  // Jeśli 401, spróbuj odświeżyć token
  if (response.status === 401) {
    token = await refreshAccessToken();
    
    if (token) {
      // Powtórz request z nowym tokenem
      headers.Authorization = `Bearer ${token}`;
      response = await fetch(url, { ...options, headers });
    } else {
      // Brak możliwości odświeżenia - przekieruj do logowania
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Authentication required');
    }
  }

  return response;
}

// Pobierz wszystkie posty
export async function getPosts(): Promise<Post[]> {
  const res = await fetch(`${API_URL}/posts/`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  
  return res.json();
}

// Utwórz nowy post (wymaga autentykacji)
export async function createPost(content: string): Promise<Post> {
  const res = await fetchWithAuth(`${API_URL}/posts/`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.content?.[0] || 'Failed to create post');
  }
  
  return res.json();
}

// Pobierz komentarze do posta
export async function getComments(postId: number) {
  const res = await fetch(`${API_URL}/posts/${postId}/comments/`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch comments');
  }
  
  return res.json();
}

// Dodaj komentarz (wymaga autentykacji)
export async function createComment(postId: number, content: string, parentId?: number) {
  const body: any = { content };
  if (parentId) body.parent = parentId;

  const res = await fetchWithAuth(`${API_URL}/posts/${postId}/comments/`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.content?.[0] || 'Failed to create comment');
  }
  
  return res.json();
}