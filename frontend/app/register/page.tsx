'use client'
import React, { useState } from 'react';
import Link from 'next/link'; // Importujemy Link do nawigacji
import Logo from '../components/Logo';

// Kopiujemy tutaj logo dla spójności wizualnej

/**
 * Strona Rejestracji
 */
export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- DODANE ---
  // Funkcja obsługująca wysłanie formularza
  const handleSubmit = (event: any) => {
    event.preventDefault();

    // Prosta walidacja sprawdzająca, czy hasła są zgodne
    if (password !== confirmPassword) {
      console.error("Hasła nie są zgodne!");
      // W prawdziwej aplikacji tutaj pokazalibyśmy błąd użytkownikowi
      return; 
    }

    // Tutaj mamy dostęp do danych
    console.log('Dane rejestracji:');
    console.log('Nazwa użytkownika:', username);
    console.log('Hasło:', password);

    // W tym miejscu docelowo znalazłaby się logika
    // wysyłania danych do API w celu utworzenia konta
    // np. await registerUser({ username, password });
  };
  return (
    <main className="bg-white min-h-screen text-gray-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-md">
        
        {/* Logo na górze formularza */}
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <h1 className="text-3xl font-bold text-center mb-6">
          Utwórz konto
        </h1>

        {/* Formularz rejestracji */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nazwa użytkownika
            </label>
            <input 
              type="text" 
              id="username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Wybierz swoją nazwę (np. @anna_dev)"
              value={username} // Powiązanie ze stanem
              onChange={(e) => setUsername(e.target.value)} // Aktualizacja stanu
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Hasło
            </label>
            <input 
              type="password" 
              id="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={password} // Powiązanie ze stanem
              onChange={(e) => setPassword(e.target.value)} // Aktualizacja stanu
            />
          </div>

          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Potwierdź hasło
            </label>
            <input 
              type="password" 
              id="confirmPassword"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={confirmPassword} // Powiązanie ze stanem
              onChange={(e) => setConfirmPassword(e.target.value)} // Aktualizacja stanu
            />
          </div>

          {/* Przycisk rejestracji */}
          <button 
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-full transition-colors duration-200 text-lg"
          >
            Zarejestruj się
          </button>
        </form>

        {/* Linki pomocnicze */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-gray-600">
            Masz już konto?{' '}
            <Link href="/login" className="text-blue-500 hover:underline font-medium">
              Zaloguj się
            </Link>
          </p>
          <p className="text-sm text-gray-600 pt-4">
            <Link href="/" className="text-blue-500 hover:underline">
              ← Wróć na stronę główną
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}
