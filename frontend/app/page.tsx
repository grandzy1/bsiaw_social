'use client'
import { Suspense, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import NewPostForm from './components/NewPostForm';
import PostList from './components/PostList';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLoggedIn(isAuthenticated());
  }, []);

  // Zapobiegaj problemom z hydratacją
  if (!mounted) {
    return (
      <main className="bg-white min-h-screen text-gray-900">
        <div className="flex max-w-7xl mx-auto">
          <Sidebar />
          <div className="w-full max-w-2xl border-x border-gray-200 min-h-screen">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
              <h1 className="text-xl font-bold p-4">Strona główna</h1>
            </header>
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen text-gray-900">
      <div className="flex max-w-7xl mx-auto">
        <Sidebar />

        <div className="w-full max-w-2xl border-x border-gray-200 min-h-screen">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <h1 className="text-xl font-bold p-4">Strona główna</h1>
          </header>

          {loggedIn ? (
            <>
              <div className="border-b border-gray-200">
                <NewPostForm />
              </div>

              <Suspense
                fallback={
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"></div>
                    <p className="text-gray-500 mt-4">Loading posts...</p>
                  </div>
                }
              >
                <PostList />
              </Suspense>
            </>
          ) : (
            <section className="p-8 pt-16 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Witaj na platformie Y!
              </h2>
              <p className="text-gray-600 text-lg mb-4">
                Musisz się zalogować, aby przeglądać i dodawać posty.
              </p>
              <Link
                href="/login"
                className="mt-8 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200 text-lg"
              >
                Zaloguj się
              </Link>
              <p className="text-sm text-gray-500 mt-6">
                Nie masz konta?{' '}
                <Link href="/register" className="text-blue-500 hover:underline">
                  Zarejestruj się
                </Link>
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}