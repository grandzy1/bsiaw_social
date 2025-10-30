'use client'
import React, { useState } from 'react';
import Link from 'next/link'; // Importujemy Link do nawigacji
import Logo from '../components/Logo';

// Kopiujemy tutaj logo dla spójności wizualnej
// W większym projekcie wynieślibyśmy to do osobnego pliku ikony


/**
 * Strona Logowania
 */
export default function LoginPage() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Funkcja obsługująca wysłanie formularza
  const handleSubmit = (event: any) => {
    // Zapobiegamy domyślnej akcji przeglądarki (przeładowaniu strony)
    event.preventDefault();
    
    // Tutaj mamy dostęp do danych z formularza
    console.log('Dane logowania:');
    console.log('Nazwa użytkownika:', username);
    console.log('Hasło:', password);

    // W tym miejscu docelowo znalazłaby się logika
    // wysyłania danych do API w celu autentykacji
    // np. await loginUser({ username, password });
  };

  return (
    <main className="bg-white min-h-screen text-gray-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-md">
        
        {/* Logo na górze formularza */}
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <h1 className="text-3xl font-bold text-center mb-6">
          Zaloguj się do Y
        </h1>

        {/* Formularz logowania */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nazwa użytkownika lub email
            </label>
            <input 
              type="text" 
              id="username"
              name="username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="np. @anna_dev"
              value={username} // Powiązanie wartości z stanem
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
              name="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={password} // Powiązanie wartości z stanem
              onChange={(e) => setPassword(e.target.value)} // Aktualizacja stanu
            />
          </div>

          {/* Przycisk logowania */}
          <button 
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-full transition-colors duration-200 text-lg"
          >
            Zaloguj się
          </button>
        </form>

        {/* Linki pomocnicze */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-gray-600">
            Nie masz konta?{' '}
            <Link href="/register" className="text-blue-500 hover:underline font-medium">
              Zarejestruj się
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
