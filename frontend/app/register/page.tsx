'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '../components/Logo';
import { api } from '../lib/api';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    // Walidacja po stronie klienta
    if (password !== confirmPassword) {
      setError('Hasła nie są zgodne');
      return;
    }

    if (password.length < 8) {
      setError('Hasło musi mieć co najmniej 8 znaków');
      return;
    }

    setIsLoading(true);

    try {
      await api.auth.register(username, email, password);
      router.push('/');
    } catch (err: any) {
      if (err.data) {
        // Obsługa błędów z backendu
        const errors = err.data;
        if (errors.username) {
          setError(`Nazwa użytkownika: ${errors.username[0]}`);
        } else if (errors.email) {
          setError(`Email: ${errors.email[0]}`);
        } else if (errors.password) {
          setError(`Hasło: ${errors.password[0]}`);
        } else {
          setError('Wystąpił błąd podczas rejestracji');
        }
      } else {
        setError('Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="bg-white min-h-screen text-gray-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-md">
        
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <h1 className="text-3xl font-bold text-center mb-6">
          Utwórz konto
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

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
              placeholder="Wybierz swoją nazwę (np. anna_dev)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              minLength={3}
            />
          </div>

          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Adres email
            </label>
            <input 
              type="email" 
              id="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="twoj@email.pl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 8 znaków</p>
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-full transition-colors duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Tworzenie konta...' : 'Zarejestruj się'}
          </button>
        </form>

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