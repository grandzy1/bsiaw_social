# Y.com - Twitter Clone

Profesjonalna aplikacja mikroblogowania zbudowana z Django REST Framework i Next.js.

## 🚀 Stack Technologiczny

### Backend
- **Django 4.2** - Framework aplikacji webowej
- **Django REST Framework** - API RESTful
- **PostgreSQL** - Baza danych
- **Token Authentication** - Bezpieczna autentykacja

### Frontend
- **Next.js 16** - React framework z Server Side Rendering
- **TypeScript** - Typowanie statyczne
- **Tailwind CSS 4** - Stylowanie

### DevOps
- **Docker & Docker Compose** - Konteneryzacja
- **Gunicorn** - WSGI server

## 📋 Wymagania

- Docker Desktop (z Docker Compose)
- Node.js 20+ (dla lokalnego developmentu)
- Python 3.11+ (dla lokalnego developmentu)

## 🛠️ Instalacja i Uruchomienie

### Sposób 1: Docker (Zalecany)

1. **Sklonuj repozytorium:**
```bash
git clone 
cd y-com
```

2. **Utwórz plik środowiskowy dla backendu:**
```bash
cd backend
cp .env.example .env
```

3. **Uruchom wszystkie serwisy:**
```bash
docker-compose up --build
```

Aplikacja będzie dostępna na:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Admin Panel: http://localhost:8000/admin

4. **Utwórz superużytkownika (w nowym terminalu):**
```bash
docker-compose exec backend python manage.py createsuperuser
```

### Sposób 2: Lokalne uruchomienie

#### Backend

1. **Przejdź do katalogu backend:**
```bash
cd backend
```

2. **Utwórz i aktywuj wirtualne środowisko:**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# lub
venv\Scripts\activate  # Windows
```

3. **Zainstaluj zależności:**
```bash
pip install -r requirements.txt
```

4. **Skonfiguruj PostgreSQL** (lokalnie lub Docker):
```bash
docker run --name ycom-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ycom_db -p 5432:5432 -d postgres:15-alpine
```

5. **Wykonaj migracje:**
```bash
python manage.py migrate
python manage.py createsuperuser
```

6. **Uruchom serwer:**
```bash
python manage.py runserver
```

#### Frontend

1. **Przejdź do głównego katalogu projektu:**
```bash
cd ..  # jeśli jesteś w backend/
```

2. **Zainstaluj zależności:**
```bash
npm install
```

3. **Utwórz plik .env.local:**
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
```

4. **Uruchom serwer deweloperski:**
```bash
npm run dev
```

## 📁 Struktura Projektu

```
y-com/
├── app/                      # Frontend Next.js
│   ├── components/          # Komponenty React
│   │   ├── Logo.tsx
│   │   └── Sidebar.tsx
│   ├── login/              # Strona logowania
│   ├── register/           # Strona rejestracji
│   ├── post/[id]/         # Szczegóły posta
│   ├── globals.css        # Style globalne
│   ├── layout.tsx         # Layout aplikacji
│   └── page.tsx           # Strona główna
├── lib/                    # Biblioteki pomocnicze
│   └── api.ts             # Klient API
├── backend/               # Backend Django
│   ├── api/              # Główna aplikacja Django
│   │   ├── models.py     # Modele bazy danych
│   │   ├── serializers.py # Serializery DRF
│   │   ├── views.py      # Widoki API
│   │   └── admin.py      # Konfiguracja panelu admin
│   ├── backend/          # Konfiguracja projektu
│   │   ├── settings.py   # Ustawienia Django
│   │   ├── urls.py       # Routing URL
│   │   └── wsgi.py       # WSGI application
│   ├── manage.py         # Django CLI
│   ├── requirements.txt  # Zależności Pythona
│   └── Dockerfile        # Dockerfile backendu
├── docker-compose.yml     # Konfiguracja Docker Compose
├── package.json          # Zależności Node.js
└── README.md            # Dokumentacja
```

## 🔑 API Endpoints

### Autentykacja
- `POST /api/auth/register/` - Rejestracja użytkownika
- `POST /api/auth/login/` - Logowanie
- `POST /api/auth/logout/` - Wylogowanie
- `GET /api/auth/user/` - Pobierz aktualnego użytkownika

### Posty
- `GET /api/posts/` - Lista wszystkich postów (paginowana)
- `POST /api/posts/` - Utwórz nowy post (wymaga auth)
- `GET /api/posts/{id}/` - Szczegóły posta
- `DELETE /api/posts/{id}/` - Usuń post (tylko własny)
- `POST /api/posts/{id}/like/` - Polub post
- `POST /api/posts/{id}/unlike/` - Usuń polubienie

### Komentarze
- `GET /api/comments/?post_id={id}` - Komentarze do posta
- `POST /api/comments/` - Dodaj komentarz
- `DELETE /api/comments/{id}/` - Usuń komentarz

### Profile
- `GET /api/profiles/{id}/` - Profil użytkownika
- `PATCH /api/profiles/{id}/` - Aktualizuj profil

## 🧪 Testowanie

### Backend
```bash
cd backend
python manage.py test
```

### Frontend
```bash
npm test
```

## 🚀 Deployment

### Backend (Produkcja)

1. **Ustaw zmienne środowiskowe:**
```env
DEBUG=False
SECRET_KEY=<your-secret-key>
ALLOWED_HOSTS=yourdomain.com
DATABASE_URL=<your-db-url>
```

2. **Zbierz pliki statyczne:**
```bash
python manage.py collectstatic --noinput
```

3. **Uruchom z Gunicorn:**
```bash
gunicorn --bind 0.0.0.0:8000 --workers 3 backend.wsgi:application
```

### Frontend (Vercel/Netlify)

1. **Zbuduj aplikację:**
```bash
npm run build
```

2. **Ustaw zmienne środowiskowe na platformie:**
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

## 🔒 Bezpieczeństwo

- Tokeny autentykacji przechowywane w localStorage (rozważ httpOnly cookies w produkcji)
- CORS skonfigurowany dla bezpieczeństwa
- Walidacja danych po stronie backendu i frontendu
- SQL injection protection przez Django ORM
- XSS protection przez React

## 📝 Funkcjonalności

- ✅ Rejestracja i logowanie użytkowników
- ✅ Tworzenie, wyświetlanie i usuwanie postów
- ✅ System polubień (like/unlike)
- ✅ Komentarze pod postami
- ✅ Profile użytkowników
- ✅ Responsywny design
- ✅ Paginacja postów
- ✅ Real-time update liczników

## 🎯 Roadmap

- [ ] Obserwowanie użytkowników
- [ ] Prywatne wiadomości
- [ ] Upload zdjęć do postów
- [ ] Powiadomienia
- [ ] Wyszukiwarka postów i użytkowników
- [ ] Hashtagi i trendy
- [ ] Dark mode

## 👥 Zespół

Grupa 2:
- Krystian Sadowski
- Michał Lipnicki
- Olaf Pawełek
- Kacper Jeziorski

## 📄 Licencja

Projekt edukacyjny - Politechnika Wrocławska

## 🐛 Zgłaszanie błędów

W przypadku znalezienia błędu, utwórz issue w repozytorium z:
1. Opisem problemu
2. Krokami do reprodukcji
3. Oczekiwanym zachowaniem
4. Aktualnym zachowaniem

## 💡 Tips & Tricks

### Szybkie resety bazy danych
```bash
docker-compose down -v
docker-compose up --build
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### Debugging
- Backend logs: `docker-compose logs -f backend`
- Frontend logs: `docker-compose logs -f frontend`
- Database: `docker-compose exec db psql -U postgres -d ycom_db`

### Przykładowe dane testowe
```bash
docker-compose exec backend python manage.py shell
```
```python
from django.contrib.auth.models import User
from api.models import Post

# Utwórz użytkownika testowego
user = User.objects.create_user('testuser', 'test@example.com', 'testpass123')

# Utwórz przykładowe posty
Post.objects.create(author=user, content="Witaj świecie! To mój pierwszy post.")
Post.objects.create(author=user, content="Kolejny dzień, kolejny post 🚀")
```