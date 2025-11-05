export default function Logo() {return(
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
);}