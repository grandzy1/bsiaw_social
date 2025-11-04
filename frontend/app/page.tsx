'use client';

import { Suspense } from 'react';
import Sidebar from './components/Sidebar';
import NewPostForm from './components/NewPostForm';
import PostList from './components/PostList';
import Link from 'next/link';

/**
 * Główna strona aplikacji z postami (OSOBA 2)
 * Integracja z istniejącym layoutem (Sidebar)
 */
export default function HomePage() {
  // TODO: Sprawdź czy użytkownik jest zalogowany
  // const isLoggedIn = false; // Zmień gdy kolega zrobi auth
  const isLoggedIn = true; // Tymczasowo true dla testów

  return (
    <main className="bg-white min-h-screen text-gray-900">
      {/* Główny kontener layoutu */}
      <div className="flex max-w-7xl mx-auto">
        {/* Kolumna 1: Boczny panel nawigacyjny */}
        <Sidebar />

        {/* Kolumna 2: Główna oś czasu (Feed) */}
        <div className="w-full max-w-2xl border-x border-gray-200 min-h-screen">
          {/* Nagłówek */}
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <h1 className="text-xl font-bold p-4">Strona główna</h1>
          </header>

          {/* Warunkowe wyświetlanie: posty lub info o logowaniu */}
          {isLoggedIn ? (
            <>
              {/* Formularz tworzenia nowego posta */}
              <div className="border-b border-gray-200">
                <NewPostForm />
              </div>

              {/* Lista postów */}
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
            /* Komunikat dla niezalogowanych użytkowników */
            <section className="p-8 pt-16 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Witaj na platformie!
              </h2>
              <p className="text-gray-600 text-lg">
                You need to login to see posts.
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

        {/* Kolumna 3: Widgety (opcjonalnie) */}
        {/* <Widgets /> */}
      </div>
    </main>
  );
}