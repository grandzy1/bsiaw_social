FROM python:3.11-slim

WORKDIR /app

# Zmienne środowiskowe
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Instalacja zależności systemowych
RUN apt-get update && apt-get install -y \
    postgresql-client \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Kopiowanie requirements
COPY requirements.txt .

# Instalacja zależności Pythona
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Kopiowanie aplikacji
COPY . .

# Migracje
# 1. Kopiujemy skrypt entrypoint
COPY entrypoint.sh /app/
# 2. Nadajemy mu uprawnienia do uruchomienia
RUN chmod +x /app/entrypoint.sh
# 3. Ustawiamy go jako entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Tworzenie katalogów dla static i media
RUN mkdir -p /app/staticfiles /app/media
RUN python manage.py collectstatic --noinput

# Ekspozycja portu
EXPOSE 8000

# Komenda domyślna
# ZMIANA: 'backend.wsgi:application' -> 'project_config.wsgi:application'
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "project_config.wsgi:application"]
