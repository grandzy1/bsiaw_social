#!/bin/sh

echo "Oczekiwanie na PostgreSQL pod adresem $DB_HOST:$DB_PORT..."

# -q (quiet) - nie wypisuj nic
# -h $DB_HOST - host bazy danych (z AWS)
# -p $DB_PORT - port
# -U $DB_USER - użytkownik
# -d $DB_NAME - nazwa bazy danych
# Pętla będzie się wykonywać, dopóki pg_isready nie zwróci statusu 0 (sukces)
while ! pg_isready -q -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"; do
  echo "Baza danych jest jeszcze niedostępna, czekam..."
  sleep 2
done

echo "PostgreSQL uruchomiony i gotowy na połączenia."

# Uruchomienie migracji
echo "Uruchamianie migracji..."
python manage.py migrate

# Uruchomienie serwera produkcyjnego
echo "Uruchamianie Gunicorn..."
exec "$@"
