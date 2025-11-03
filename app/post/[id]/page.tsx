// Plik: app/post/[id]/page.tsx
// Strona wyświetlająca szczegóły pojedynczego posta.
'use client'
import React from 'react';
import { useSearchParams } from 'next/navigation'
import { useParams } from 'next/navigation'
import Sidebar from '@/app/components/Sidebar';
// Poprawiona ścieżka importu (3 poziomy w górę do roota projektu)


/**
 * Wymusza dynamiczne renderowanie (SSR) tej strony.
 * Gwarantuje to, że `params` będą zawsze świeże przy każdym żądaniu.
 */
export const dynamic = 'force-dynamic';

// --- Ikony ---

// Ikona Wstecz (ArrowLeft)
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

// Komponent do odpowiedzi (zdefiniowany w tym samym pliku)
const ReplyInput = () => {
  return (
    <div className="flex p-4 border-b border-gray-200">
      <div className="flex-shrink-0 mr-4">
        <img
          src="https://placehold.co/48x48/7C3AED/FFFFFF?text=TY" // Placeholder "TY" (Ty)
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

/**
 * Dedykowana strona dla pojedynczego posta
 * Odbiera 'params' z dynamicznego segmentu URL '[id]'
 */
export default function SinglePostPage() {
   const params = useParams<{ id: string; }>()
 
  // console.log(params);
  
  
  // Pobieramy ID posta bezpośrednio z parametrów URL
  // const postId = id;

  return (
    <main className="bg-white min-h-screen text-gray-900">
      <div className="flex max-w-7xl mx-auto">
        
        {/* Kolumna 1: Boczny panel nawigacyjny */}
        <Sidebar />

        {/* Kolumna 2: Treść posta */}
        <div className="w-full max-w-2xl border-x border-gray-200 min-h-screen">
          
          {/* Nagłówek ze strzałką "Wstecz" */}
          <header className="sticky top-0 z-10 flex items-center space-x-4 bg-white/80 backdrop-blur-md border-b border-gray-200 p-3">
            <button className="p-2 rounded-full hover:bg-gray-200">
              <BackIcon />
            </button>
            <h1 className="text-xl font-bold">Post</h1>
          </header>

          {/* Szczegóły posta - teraz wyświetlają tylko ID */}
          <section className="p-4 border-b border-gray-200">
            
            {/* Informacje o użytkowniku usunięte */}

            {/* Treść posta (zastąpiona przez ID) */}
            <p className="text-gray-900 text-2xl mt-1 mb-4 whitespace-pre-wrap break-all">
              ID Posta: <span className="font-mono text-blue-600">{params.id}</span>
            </p>

            {/* Data usunięta */}
            {/* Statystyki (Polubienia, RT) usunięte */}
            {/* Przyciski akcji usunięte */}
          </section>

          {/* Formularz odpowiedzi */}
          <ReplyInput />
          
          {/* Przykładowe odpowiedzi (w przyszłości) */}
          <div className="p-4 text-center text-gray-400 border-b border-gray-200">
            <p className="italic">Tu pojawią się odpowiedzi...</p>
          </div>

        </div>

        {/* Kolumna 3: Widgety (pozostaje pusta) */}
        {/* <Widgets /> */}

      </div>
    </main>
  );
}

