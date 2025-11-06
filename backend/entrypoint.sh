#!/bin/sh

# Oczekiwanie na uruchomienie bazy danych
# (W produkcji lepiej użyć bardziej zaawansowanego mechanizmu)
echo "Oczekiwanie na PostgreSQL..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL uruchomiony."

# Uruchomienie migracji
echo "Uruchamianie migracji..."
python manage.py migrate

# Uruchomienie serwera deweloperskiego
echo "Uruchamianie serwera deweloperskiego..."
python manage.py runserver 0.0.0.0:8000