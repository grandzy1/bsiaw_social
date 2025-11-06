'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from '@/app/components/Sidebar';
import Link from 'next/link';
import { api, Post, Profile } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

// Komponent pojedynczego posta
function PostCard({ post, onLike, onDelete, currentUser }: { 
  post: Post; 
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
  currentUser: Profile | null;
}) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    router.push(`/post/${post.id}`);
  };

  const handleCommentClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); 
    router.push(`/post/${post.id}?comment=true`); 
  };

  return (
    <div 
      onClick={handleCardClick}
      className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {post.author_username[0].toUpperCase()}
          </div>
        </div>

        {/* Treść posta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-900 hover:underline cursor-pointer">
              {post.author_username}
            </span>
            <span className="text-gray-500 text-sm">
              · {formatDate(post.created_at)}
            </span>
          </div>

          <p className="text-gray-900 mb-3 whitespace-pre-wrap break-words">
            {post.content}
          </p>

          {/* Akcje */}
          <div className="flex gap-6 text-gray-500">
            <button 
              onClick={handleCommentClick}
              className="flex items-center gap-2 hover:text-blue-500 transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm">{post.comments_count}</span>
            </button>

            <button 
              onClick={(e) => {
                e.stopPropagation(); 
                onLike(post.id);
              }}
              disabled={!currentUser}
              className={`flex items-center gap-2 transition-colors z-10 ${
                post.is_liked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'hover:text-red-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <svg className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} 
                fill={post.is_liked ? 'currentColor' : 'none'} 
                stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm">{post.likes_count}</span>
            </button>

            {post.can_delete && (
              <button 
                onClick={(e) => {
                  e.stopPropagation(); 
                  onDelete(post.id);
                }}
                className="flex items-center gap-2 hover:text-red-500 transition-colors ml-auto z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponent formularza do tworzenia posta
function CreatePost({ onPostCreated, currentUser }: { onPostCreated: () => void, currentUser: Profile }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      await api.posts.create(content);
      setContent('');
      onPostCreated();
    } catch (err: any) {
      setError(err.data?.content?.[0] || 'Nie udało się utworzyć posta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-b border-gray-200 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {currentUser.username[0].toUpperCase()}
            </div>
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent text-gray-900 text-xl placeholder-gray-500 outline-none resize-none border-none focus:ring-0"
              placeholder="Co się dzieje?"
              rows={3}
              maxLength={280}
              disabled={isSubmitting}
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-500">
                {content.length}/280
              </span>
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Publikowanie...' : 'Opublikuj'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// Główna strona
export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      let user: Profile | null = null;
      
      // 1. Sprawdź, czy użytkownik jest zalogowany
      try {
        user = await api.auth.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        // To jest OK, użytkownik jest gościem.
        setCurrentUser(null);
      }

      // 2. Jeśli użytkownik jest zalogowany, załaduj posty
      if (user) {
        try {
          const response = await api.posts.list();
          setPosts(response.results);
          setError('');
        } catch (err) {
          console.error(err);
          setError('Nie udało się załadować postów');
        }
      }
      
      // 3. Zakończ ładowanie
      setIsLoading(false);
    };
    
    loadData();
  }, [pathname]); // Zależność od pathname zapewnia odświeżenie po nawigacji

  const handleLike = async (postId: number) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // Użyj danych zwróconych z serwera.
    try {
      let updatedPost: Post;
      if (post.is_liked) {
        updatedPost = await api.posts.unlike(postId);
      } else {
        updatedPost = await api.posts.like(postId);
      }
      
      // Zaktualizuj stan `posts` zamieniając stary post na nowy
      setPosts(currentPosts => 
        currentPosts.map(p => (p.id === updatedPost.id ? updatedPost : p))
      );
      
    } catch (err) {
      console.error('Błąd podczas polubienia posta', err);
      // W razie błędu, odśwież wszystko
      const response = await api.posts.list();
      setPosts(response.results);
    }
  };
  
  // Funkcja wywoływana po utworzeniu posta (przez CreatePost)
  const handlePostCreated = async () => {
    try {
      const response = await api.posts.list();
      setPosts(response.results);
    } catch (err) {
      console.error(err);
      setError('Nie udało się odświeżyć postów');
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('Czy na pewno chcesz usunąć ten post?')) return;

    try {
      await api.posts.delete(postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      alert('Nie udało się usunąć posta');
    }
  };

  // Renderowanie treści
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-8 text-center text-gray-500">
          Ładowanie...
        </div>
      );
    }

    // Widok dla gościa (niezalogowanego)
    if (!currentUser) {
      return (
        <div className="border-b border-gray-200 p-8 text-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Witaj w Y.com
          </h2>
          <p className="text-gray-600 mb-4">
            Zaloguj się, aby zobaczyć posty i dołączyć do społeczności.
          </p>
          <Link 
            href="/login" 
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
          >
            Zaloguj się
          </Link>
        </div>
      );
    }
    
    // Widok dla zalogowanego
    return (
      <>
        <CreatePost onPostCreated={handlePostCreated} currentUser={currentUser} />
        
        {error ? (
          <div className="p-8 text-center text-red-500">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Brak postów do wyświetlenia. Napisz pierwszy post!
          </div>
        ) : (
          <div>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onDelete={handleDelete}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <main className="bg-white min-h-screen text-gray-900">
      <div className="flex max-w-7xl mx-auto">
        <Sidebar />

        <div className="w-full max-w-2xl border-x border-gray-200 min-h-screen">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <h1 className="text-xl font-bold p-4">Strona główna</h1>
          </header>
          
          {renderContent()}

        </div>
      </div>
    </main>
  );
}