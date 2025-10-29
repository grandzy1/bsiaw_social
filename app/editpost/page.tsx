// Plik: app/compose/post/page.tsx
// Dedykowana strona do tworzenia/dodawania nowych postów.

import React from 'react';
import Sidebar from '../components/Sidebar';
// Importujemy Sidebar ze ścieżką względną (o dwa poziomy wyżej)
// POPRAWIONA ŚCIEŻKA: Zakładamy, że folder 'components' jest w głównym folderze projektu (poza 'app')

/**
 * Komponent formularza do tworzenia nowego posta
 * (Bazowany na komponencie TweetInput z poprzedniej wersji)
 */
const ComposeForm = () => {
  return (
    // Zmieniono kolor ramki na jasnoszary
    <div className="flex p-4 border-b border-gray-200">
      {/* Avatar użytkownika (placeholder) */}
      <div className="flex-shrink-0 mr-4">
        <img
          src="https://placehold.co/48x48/7C3AED/FFFFFF?text=TY" // Placeholder "TY" (Ty)
          alt="Twój avatar"
          className="w-12 h-12 rounded-full"
        />
      </div>
      {/* Pole tekstowe i przycisk */}
      <div className="w-full">
        <textarea
          // Zmieniono kolor tekstu na ciemny
          className="w-full bg-transparent text-gray-900 text-xl placeholder-gray-500 outline-none resize-none"
          placeholder="Co się dzieje?"
          rows={7} // Więcej miejsca na dedykowanej stronie
        />
        <div className="flex justify-end items-center mt-2">
          {/* Przycisk pozostaje niebieski */}
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200">
            Opublikuj
          </button>
        </div>
      </div>
    </div>
  );
};


/**
 * Dedykowana strona do tworzenia nowego posta
 */
export default function ComposePostPage() {
  return (
    // Główny kontener strony
    <main className="bg-white min-h-screen text-gray-900">
      {/* Główny kontener layoutu (Flexbox). */}
      <div className="flex max-w-7xl mx-auto">
        
        {/* Kolumna 1: Boczny panel nawigacyjny */}
        <Sidebar />

        {/* Kolumna 2: Formularz publikowania */}
        <div className="w-full max-w-2xl border-x border-gray-200 min-h-screen">
          
          {/* Nagłówek */}
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <h1 className="text-xl font-bold p-4">Opublikuj nowego posta</h1>
          </header>

          {/* Formularz */}
          <ComposeForm />
          
          {/* Uwaga: Strona do EDYCJI posta byłaby bardziej skomplikowana.
              Wymagałaby dynamicznego routingu (np. app/post/[id]/edit/page.tsx)
              oraz wczytania danych posta, który chcesz edytować.
              Na razie jest to strona do DODAWANIA nowego posta. */}

        </div>

        {/* Kolumna 3: Widgety (pozostaje pusta) */}
        {/* <Widgets /> */}

      </div>
    </main>
  );
}

