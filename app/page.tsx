// Plik: app/page.tsx (Główna strona)
// Został oczyszczony zgodnie z prośbą.

import React from 'react';
// Zakładamy, że komponent Sidebar jest w app/components/Sidebar.tsx
import Sidebar from './components/Sidebar';

// Wszystkie definicje ikon (CommentIcon, etc.) zostały usunięte.
// Dane mockPosts zostały usunięte.
// Komponenty TweetInput i TweetCard zostały usunięte.

/**
 * Główna strona aplikacji (ZMODYFIKOWANA)
 * Teraz pokazuje informację o logowaniu zamiast postów.
 */
export default function HomePage() {
  return (
    // Główny kontener strony
    <main className="bg-white min-h-screen text-gray-900">
      {/* Główny kontener layoutu (Flexbox). */}
      <div className="flex max-w-7xl mx-auto">
        
        {/* Kolumna 1: Boczny panel nawigacyjny */}
        <Sidebar />

        {/* Kolumna 2: Główna oś czasu (Feed) */}
        <div className="w-full max-w-2xl border-x border-gray-200 min-h-screen">
          
          {/* Nagłówek */}
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <h1 className="text-xl font-bold p-4">Strona główna</h1>
          </header>

          {/* Komponent TweetInput został USUNIĘTY */}
          
          {/* Sekcja postów została ZASTĄPIONA przez ten komunikat */}
          <section className="p-8 pt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Witaj na platformie!
            </h2>
            <p className="text-gray-600 text-lg">
              You need to login to see posts.
            </p>
            
            {/* Dodałem przycisk logowania dla wygody */}
            <a 
              href="/login" 
              className="mt-8 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200 text-lg"
            >
              Zaloguj się
            </a>
            
            <p className="text-sm text-gray-500 mt-6">
              Nie masz konta?{' '}
              <a href="/register" className="text-blue-500 hover:underline">
                Zarejestruj się
              </a>
            </p>
          </section>

        </div>

        {/* Kolumna 3: Widgety (pozostaje pusta) */}
        {/* <Widgets /> */}

      </div>
    </main>
  );
}

