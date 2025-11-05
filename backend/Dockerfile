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

# Tworzenie katalogów dla static i media
RUN mkdir -p /app/staticfiles /app/media

# Ekspozycja portu
EXPOSE 8000

# Komenda domyślna
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "backend.wsgi:application"]