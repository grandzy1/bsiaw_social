// Plik: app/post/[id]/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
// POPRAWKA: Poprawiona ścieżka importu (o 3 poziomy w górę, potem do app/components)
import Sidebar from '@/app/components/Sidebar'; 
import { api, Post } from '@/lib/api'; // Importujemy API i typ Post

export const dynamic = 'force-dynamic';

// --- Ikony ---
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

// Komponent do odpowiedzi
const ReplyInput = () => {
  return (
    <div className="flex p-4 border-b border-gray-200">
      <div className="flex-shrink-0 mr-4">
        <img
          src="https://placehold.co/48x48/7C3AED/FFFFFF?text=TY"
          alt="Twój avatar"
          className="w-12 h-12 rounded-full"
        />
      </div>
      <div className="w-full">
        <textarea
          className="w-full bg-transparent text-gray-900 text-xl placeholder-gray-500 outline-none resize-none"
          placeholder="Opublikuj swoją odpowiedź"
          rows={3}
        />
        <div className="flex justify-end items-center mt-2">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded-full transition-colors duration-200">
            Odpowiedz
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SinglePostPage() {
  const params = useParams<{ id: string; }>()
  const router = useRouter();
  
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      const fetchPost = async () => {
        try {
          setIsLoading(true);
          const postId = Number(params.id);
          if (isNaN(postId)) {
            setError('Nieprawidłowe ID posta');
            return;
          }
          const fetchedPost = await api.posts.get(postId);
          setPost(fetchedPost);
        } catch (err) {
          console.error("Nie udało się pobrać posta", err);
          setError('Nie można wczytać posta. Być może został usunięty.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchPost();
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <main className="bg-white min-h-screen text-gray-900">
      <div className="flex max-w-7xl mx-auto">
        
        <Sidebar />

        <div className="w-full max-w-2xl border-x border-gray-200 min-h-screen">
          
          <header className="sticky top-0 z-10 flex items-center space-x-4 bg-white/80 backdrop-blur-md border-b border-gray-200 p-3">
            <button 
              onClick={() => router.back()} 
              className="p-2 rounded-full hover:bg-gray-200"
              aria-label="Wróć"
            >
              <BackIcon />
            </button>
            <h1 className="text-xl font-bold">Post</h1>
          </header>

          {/* Dynamiczna zawartość posta */}
          {isLoading && (
            <div className="p-8 text-center text-gray-500">
              Ładowanie posta...
            </div>
          )}
          {error && (
            <div className="p-8 text-center text-red-500">
              {error}
            </div>
          )}
          {!isLoading && !error && post && (
            <section className="p-4 border-b border-gray-200">
              
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {post.author_username[0].toUpperCase()}
                </div>
                <div>
                  <span className="font-bold text-gray-900 hover:underline cursor-pointer">
                    {post.author_username}
                  </span>
                  <p className="text-gray-500 text-sm">@{post.author_username}</p>
                </div>
              </div>

              <p className="text-gray-900 text-2xl mt-1 mb-4 whitespace-pre-wrap break-words">
                {post.content}
              </p>

              <p className="text-gray-500 text-sm mb-4">
                {formatDate(post.created_at)}
              </p>
              
              <div className="flex gap-4 py-3 border-t border-gray-200 text-sm text-gray-600">
                <span><span className="font-bold">{post.comments_count}</span> Komentarzy</span>
                <span><span className="font-bold">{post.likes_count}</span> Polubień</span>
              </div>
              
            </section>
          )}

          {/* Formularz odpowiedzi */}
          {!isLoading && post && <ReplyInput />}
          
          <div className="p-4 text-center text-gray-400 border-b border-gray-200">
            <p className="italic">Tu pojawią się odpowiedzi...</p>
          </div>

        </div>
      </div>
    </main>
  );
}