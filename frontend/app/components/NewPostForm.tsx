'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPost } from '@/lib/api';

export default function NewPostForm() {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const MAX_LENGTH = 280;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Post cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await createPost(content);
      setContent('');
      router.refresh(); // Odśwież stronę aby pokazać nowy post
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          maxLength={MAX_LENGTH}
          disabled={isSubmitting}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div className="flex justify-between items-center mt-3">
          <span className={`text-sm ${content.length > MAX_LENGTH - 20 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
            {content.length}/{MAX_LENGTH}
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
        {error && (
          <div className="mt-2 text-red-500 text-sm">{error}</div>
        )}
      </form>
    </div>
  );
}