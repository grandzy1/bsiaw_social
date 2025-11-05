'use client'
import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import Link from 'next/link';
import { isAuthenticated, logout } from '@/lib/auth';

// Ikony
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
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="w-72 flex-shrink-0 p-4 h-screen sticky top-0">
      <nav className="flex flex-col space-y-2">
        <div className="p-3 w-min">
          <Logo />
        </div>
        
        <Link 
          href="/"
          className="flex items-center space-x-4 p-3 pr-6 rounded-full hover:bg-gray-200 transition-colors duration-200 w-full"
        >
          <HomeIcon />
          <span className="text-xl font-bold">Posty</span>
        </Link>
        
        {loggedIn ? (
          <>
            <Link 
              href="/profile"
              className="flex items-center space-x-4 p-3 pr-6 rounded-full hover:bg-gray-200 transition-colors duration-200 w-full"
            >
              <ProfileIcon />
              <span className="text-xl font-bold">Profil</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-4 p-3 pr-6 rounded-full hover:bg-gray-200 transition-colors duration-200 w-full text-left"
            >
              <LogoutIcon />
              <span className="text-xl font-bold">Wyloguj</span>
            </button>

            <Link 
              href="/create" 
              className="text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full w-full text-lg mt-4"
            >
              Opublikuj
            </Link>
          </>
        ) : (
          <Link 
            href="/login"
            className="flex items-center space-x-4 p-3 pr-6 rounded-full hover:bg-gray-200 transition-colors duration-200 w-full"
          >
            <ProfileIcon />
            <span className="text-xl font-bold">Zaloguj się</span>
          </Link>
        )}
      </nav>
    </aside>
  );
}