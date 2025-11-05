// Plik: app/profile/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { api, Profile } from '../lib/api'; // Importujemy Profile
import { useRouter } from 'next/navigation';

/**
 * Dedykowana strona do wyświetlania profilu użytkownika
 */
export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Używamy getCurrentUser, aby pobrać profil zalogowanej osoby
        const userProfile = await api.auth.getCurrentUser();
        setProfile(userProfile);
      } catch (error) {
        // Prawdopodobnie niezalogowany, przekieruj do logowania
        console.error("Błąd pobierania profilu", error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  if (isLoading) {
    return (
      <main className="bg-white min-h-screen text-gray-900">
        <div className="flex max-w-7xl mx-auto">
          <Sidebar />
          <div className="w-full max-w-2xl border-x border-gray-200 min-h-screen">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
              <h1 className="text-xl font-bold p-4">Profil</h1>
            </header>
            <div className="p-8 text-center text-gray-500">Ładowanie profilu...</div>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    // Powinno nastąpić przekierowanie, ale na wszelki wypadek
    return null;
  }

  return (
    <main className="bg-white min-h-screen text-gray-900">
      <div className="flex max-w-7xl mx-auto">
        
        <Sidebar />

        <div className="w-full max-w-2xl border-x border-gray-200 min-h-screen">
          
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <h1 className="text-xl font-bold p-4">Profil</h1>
          </header>

          <section className="p-8 flex flex-col items-center pt-12">
            
            <div className="w-40 h-40 mb-6">
              <img
                src={profile.avatar || `https://placehold.co/160x160/7C3AED/FFFFFF?text=${profile.username[0].toUpperCase()}`}
                alt="Zdjęcie profilowe"
                className="w-full h-full rounded-full border-4 border-white shadow-lg"
              />
            </div>

            <h2 className="text-3xl font-bold text-gray-900">
              {profile.username}
            </h2>
            <p className="text-gray-500 text-lg">
              @{profile.username}
            </p>

            <p className="text-gray-700 text-base mt-4 max-w-md text-center">
              {profile.bio || <i>Użytkownik nie dodał jeszcze bio.</i>}
            </p>

            <p className="text-sm text-gray-400 mt-8">
              Dołączył: {new Date(profile.created_at).toLocaleDateString('pl-PL')}
            </p>
            
          </section>

        </div>

      </div>
    </main>
  );
}