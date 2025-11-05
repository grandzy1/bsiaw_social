'use client'
import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// ZMIANA: Poprawiona ścieżka importu z '../lib/api' na '@/lib/api'
// ZMIANA: Poprawiony typ User na Profile (zgodnie z logiką logowania)
import { api, Profile } from '@/lib/api';

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
);

export default function Sidebar() {
  // ZMIANA: Typ z User na Profile
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      // Używamy isAuthenticated do szybkiego sprawdzenia (czy jest cookie)
      if (api.auth.isAuthenticated()) { 
        try {
          const user = await api.auth.getCurrentUser();
          setCurrentUser(user);
        } catch (err) {
          // Token nieważny, czyścimy
          setCurrentUser(null);
          api.auth.logout(); // Wyczyść stare tokeny
        }
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.auth.logout();
      setCurrentUser(null);
      router.push('/');
      router.refresh(); // Wymuś odświeżenie stanu aplikacji
    } catch (err) {
      console.error('Błąd podczas wylogowania', err);
    }
  };

  return (
    <aside className="w-72 flex-shrink-0 p-4 h-screen sticky top-0">
      <nav className="flex flex-col space-y-2">
        {/* Logo */}
        <div className="p-3 w-min">
          <Logo />
        </div>
        
        {/* Link do strony głównej */}
        <Link 
          href="/"
          className="flex items-center space-x-4 p-3 pr-6 rounded-full hover:bg-gray-200 transition-colors duration-200 w-full"
        >
          <HomeIcon />
          <span className="text-xl font-bold">Strona główna</span>
        </Link>
        
        {/* Sekcja użytkownika */}
        {currentUser ? (
          <>
            {/* Profil */}
            <Link 
              href="/profile"
              className="flex items-center space-x-4 p-3 pr-6 rounded-full hover:bg-gray-200 transition-colors duration-200 w-full"
            >
              <ProfileIcon />
              <span className="text-xl font-bold">Profil</span>
            </Link>

            {/* Wyloguj */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-4 p-3 pr-6 rounded-full hover:bg-gray-200 transition-colors duration-200 w-full text-left"
            >
              <LogoutIcon />
              <span className="text-xl font-bold">Wyloguj</span>
            </button>

            {/* Przycisk publikowania */}
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full w-full text-lg mt-4"
            >
              Opublikuj
            </button>

            {/* Info o użytkowniku */}
            <div className="mt-auto pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-100 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {currentUser.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{currentUser.username}</p>
                  <p className="text-gray-500 text-sm truncate">{currentUser.email}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Login dla niezalogowanych */}
            <Link 
              href="/login"
              className="flex items-center space-x-4 p-3 pr-6 rounded-full hover:bg-gray-200 transition-colors duration-200 w-full"
            >
              <ProfileIcon />
              <span className="text-xl font-bold">Zaloguj się</span>
            </Link>

            {/* Przycisk rejestracji */}
            <Link 
              href="/register"
              className="text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full w-full text-lg mt-4"
            >
              Zarejestruj się
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}