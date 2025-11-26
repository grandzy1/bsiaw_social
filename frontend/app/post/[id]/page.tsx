// Plik: app/post/[id]/page.tsx
'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
// ZMIANA: Poprawiona ścieżka importu
import Sidebar from '@/app/components/Sidebar'; 
import { api, Post, Comment, Profile } from '@/lib/api'; 

export const dynamic = 'force-dynamic';

// --- Ikony ---
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

const ReplyInput = ({ postId, onCommentPosted, focusRef }: { 
  postId: number; 
  onCommentPosted: () => void;
  focusRef: React.Ref<HTMLTextAreaElement>; 
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      await api.comments.create(postId, content);
      setContent('');
      onCommentPosted(); 
    } catch (err) {
      setError('Nie udało się dodać komentarza.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex p-4 border-b border-gray-200">
      <div className="flex-shrink-0 mr-4">
        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          TY
        </div>
      </div>
      <div className="w-full">
        <textarea
          ref={focusRef} 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-transparent text-gray-900 text-xl placeholder-gray-500 outline-none resize-none"
          placeholder="Opublikuj swoją odpowiedź"
          rows={3}
          disabled={isSubmitting}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <div className="flex justify-end items-center mt-2">
          <button 
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded-full transition-colors duration-200 disabled:opacity-50"
          >
            {isSubmitting ? 'Wysyłanie...' : 'Odpowiedz'}
          </button>
        </div>
      </div>
    </form>
  );
};

const CommentCard = ({ comment }: { comment: Comment }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
            {comment.author_username[0].toUpperCase()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-900">{comment.author_username}</span>
            <span className="text-gray-500 text-sm">· {formatDate(comment.created_at)}</span>
          </div>
          <p className="text-gray-900 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function SinglePostPage() {
  const params = useParams<{ id: string; }>()
  const router = useRouter();
  const searchParams = useSearchParams();
  const commentRef = useRef<HTMLTextAreaElement>(null); 
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const postId = Number(params.id);

  const fetchComments = async () => {
    if (isNaN(postId)) return;
    try {
      const fetchedComments = await api.comments.list(postId);
      setComments(fetchedComments); 
    } catch (err) {
      console.error("Nie udało się pobrać komentarzy", err);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      if (isNaN(postId)) {
        setError('Nieprawidłowe ID posta');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const fetchedPost = await api.posts.get(postId);
        setPost(fetchedPost);
        await fetchComments();
      } catch (err) {
        console.error("Nie udało się pobrać posta", err);
        setError('Nie można wczytać posta. Być może został usunięty.');
      } finally {
        setIsLoading(false);
      }
    };
    
    const loadUser = async () => {
      try {
        const user = await api.auth.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        setCurrentUser(null);
      }
    };

    fetchPost();
    loadUser();

    if (searchParams.get('comment') === 'true' && commentRef.current) {
      commentRef.current.focus();
    }
    
  }, [params.id, postId, searchParams]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const refreshPostData = async () => {
    if (isNaN(postId)) return;
    try {
      const fetchedPost = await api.posts.get(postId);
      setPost(fetchedPost);
    } catch (err) {
      console.error("Nie udało się odświeżyć posta", err);
    }
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
                <span><span className="font-bold">{comments.length}</span> Komentarzy</span>
                <span><span className="font-bold">{post.likes_count}</span> Polubień</span>
              </div>
              
            </section>
          )}

          {!isLoading && post && currentUser && (
            <ReplyInput 
              postId={post.id} 
              onCommentPosted={() => {
                fetchComments(); 
                refreshPostData(); 
              }}
              focusRef={commentRef} 
            />
          )}
          
          <div>
            {comments.length > 0 ? (
              comments.map(comment => (
                <CommentCard key={comment.id} comment={comment} />
              ))
            ) : (
              !isLoading && (
                <div className="p-4 text-center text-gray-400 border-b border-gray-200">
                  <p className="italic">Brak komentarzy. Bądź pierwszy!</p>
                </div>
              )
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
