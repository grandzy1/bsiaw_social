// Plik: app/profile/page.tsx
// Dedykowana strona do wyświetlania profilu użytkownika.
'use client'
import React from 'react';
import Sidebar from '../components/Sidebar';
// Importujemy Sidebar ze ścieżką względną

/**
 * Dedykowana strona do wyświetlania profilu użytkownika
 */
export default function ProfilePage() {
  return (
    // Główny kontener strony
    <main className="bg-white min-h-screen text-gray-900">
      {/* Główny kontener layoutu (Flexbox). */}
      <div className="flex max-w-7xl mx-auto">
        
        {/* Kolumna 1: Boczny panel nawigacyjny */}
        <Sidebar />

        {/* Kolumna 2: Treść profilu */}
        <div className="w-full max-w-2xl border-x border-gray-200 min-h-screen">
          
          {/* Nagłówek */}
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <h1 className="text-xl font-bold p-4">Profil</h1>
          </header>

          {/* Treść profilu */}
          <section className="p-8 flex flex-col items-center pt-12">
            
            {/* Zdjęcie profilowe (placeholder) */}
            <div className="w-40 h-40 mb-6">
              <img
                src="https://placehold.co/160x160/7C3AED/FFFFFF?text=USER" // Placeholder 160x160
                alt="Zdjęcie profilowe"
                className="w-full h-full rounded-full border-4 border-white shadow-lg"
              />
            </div>

            {/* Nazwa użytkownika */}
            <h2 className="text-3xl font-bold text-gray-900">
              Nazwa Użytkownika
            </h2>
            <p className="text-gray-500 text-lg">
              @username_handle
            </p>

            {/* Informacja o braku edycji */}
            {/* <p className="text-sm text-gray-400 mt-8 italic">
              (To jest statyczny widok profilu.)
            </p> */}
            
          </section>

          {/* Tutaj w przyszłości mogłyby być posty tego użytkownika */}

        </div>

        {/* Kolumna 3: Widgety (pozostaje pusta) */}
        {/* <Widgets /> */}

      </div>
    </main>
  );
}
