import React from 'react';
// USUNIĘTO IMPORT 'next/link', aby naprawić błąd

// --- IKONY POTRZEBNE DLA SIDEBARA ---

// Ikona: Strona Główna (Home)
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

// Ikona: Logowanie/Profil (User)
const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const YLogoLongerLeg = () => (
  <svg 
    viewBox="0 0 24 36" 
    aria-hidden="true" 
    className="w-16 h-16 text-blue-500" // Główny kolor (niebieski)
    fill="none" 
    stroke="currentColor" // Domyślny kolor kreski (niebieski)
    strokeWidth="4"     // Domyślna grubość kreski (to będzie "obramówka")
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <defs>
      <filter id="drop-shadow-y-longer" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow 
          dx="2" 
          dy="2" 
          stdDeviation="1.5" 
          floodColor="#000000" 
          floodOpacity="0.4" 
        />
      </filter>
    </defs>

    <g style={{ filter: 'url(#drop-shadow-y-longer)' }}>
      {/* WARSTWA 1: Całe "Y" narysowane na niebiesko (baza i obramówka) */}
      <polyline points="4 4 12 14 20 4" />
      <line x1="12" y1="14" x2="12" y2="30" /> {/* ZMIANA TUTAJ: y2="22" */}

      {/* WARSTWA 2: Biała linia narysowana NA WIERZCHU prawego ramienia */}
      <polyline 
        points="12 14 20 4" 
        stroke="white" 
        strokeWidth="2" 
      />
    </g>
  </svg>
);



// --- KOMPONENTY WEWNĘTRZNE SIDEBARA ---

// (Usunęliśmy komponent SidebarButton, ponieważ zastępujemy go bezpośrednio tagiem <a>)


/**
 * Główny komponent: Boczny panel nawigacyjny (Sidebar)
 * Eksportujemy go jako domyślny (export default)
 */
export default function Sidebar() {
  return (
    // Używamy sticky, aby panel został na miejscu podczas przewijania
    <aside className="w-72 flex-shrink-0 p-4 h-screen sticky top-0">
      <nav className="flex flex-col space-y-2">
        {/* Logo */}
        <div className="p-3 w-min">
          <YLogoLongerLeg />
        </div>
        
        {/* Przyciski nawigacyjne ZASTĄPIONE PRZEZ TAGI <a> */}
        
        {/* Link do strony głównej (jako <a>) */}
        <a 
          href="/"
          className="flex items-center space-x-4 p-3 pr-6 rounded-full hover:bg-gray-200 transition-colors duration-200 w-full"
        >
          <HomeIcon />
          <span className="text-xl font-bold">Posty</span>
        </a>
        
        {/* Link do strony logowania (jako <a>) */}
        <a 
          href="/login"
          className="flex items-center space-x-4 p-3 pr-6 rounded-full hover:bg-gray-200 transition-colors duration-200 w-full"
        >
          <ProfileIcon />
          <span className="text-xl font-bold">Login</span>
        </a>
        
        {/* Główny przycisk "Opublikuj" - pozostaje przyciskiem (button) */}
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full w-full text-lg mt-4">
          Opublikuj
        </button>
      </nav>
    </aside>
  );
};

