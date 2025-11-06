'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/app/components/Logo';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // POPRAWKA: Przekieruj, jeśli użytkownik jest już zalogowany
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.auth.getCurrentUser();
        // Jeśli sukces, użytkownik jest zalogowany
        router.push('/');
      } catch (error) {
        // Błąd, użytkownik nie jest zalogowany - zostań na stronie
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.auth.login(username, password);
      // Użyj twardego przeładowania, aby odświeżyć cały stan aplikacji
      window.location.href = '/';
    } catch (err: any) {
      if (err.data && err.data.error) {
        setError(err.data.error);
      } else {
        setError('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
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
          Zaloguj się do Y
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
              name="username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="np. @anna_dev"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              name="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-full transition-colors duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

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