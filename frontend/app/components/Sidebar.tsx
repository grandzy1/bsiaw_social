'use client'
import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await api.auth.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        setCurrentUser(null);
      }
    };
    loadUser();
  }, [pathname]); // Odświeżaj stan użytkownika przy każdej zmianie strony

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error('Błąd podczas wylogowania', err);
    } finally {
      // POPRAWKA: Użyj twardego przeładowania, aby
      // wymusić odświeżenie stanu na wszystkich komponentach.
      window.location.href = '/';
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

            {/* Link do rejestracji (przeniesiony z przycisku) */}
            <Link 
              href="/register"
              className="flex items-center space-x-4 p-3 pr-6 rounded-full hover:bg-gray-200 transition-colors duration-200 w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
              <span className="text-xl font-bold">Zarejestruj się</span>
            </Link>

          </>
        )}
      </nav>
    </aside>
  );
}