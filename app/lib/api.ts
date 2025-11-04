import { Post } from '../types/post';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function getPosts(): Promise<Post[]> {
  const res = await fetch(`${API_URL}/posts/`, {
    cache: 'no-store', // Zawsze pobieraj świeże dane
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }
  
  return res.json();
}

export async function createPost(content: string): Promise<Post> {
  const res = await fetch(`${API_URL}/posts/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // TODO: Dodaj token gdy JWT będzie gotowe
      // 'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.content?.[0] || 'Failed to create post');
  }
  
  return res.json();
}