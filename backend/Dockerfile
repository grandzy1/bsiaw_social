FROM python:3.11-slim

# 1. Tworzymy grupę oraz użytkownika aplikacji  
RUN groupadd -g 1000 appgroup && \
    useradd -u 1000 -g appgroup appuser

WORKDIR /app

# 2. Instalacja zależności systemowych (jako root)
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 3. Przygotowanie folderów ZANIM przełączymy użytkownika
# Tworzymy je i od razu oddajemy appuserowi
RUN mkdir -p /app/staticfiles /app/media /app/tmp && \
    chown -R appuser:appgroup /app

# 4. Instalacja zależności Pythona
# (Robimy to przed kopiowaniem kodu, aby lepiej wykorzystać cache)
COPY --chown=appuser:appgroup requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 5. Kopiowanie reszty aplikacji
COPY --chown=appuser:appgroup . .

# 6. Entrypoint (musi być wykonywalny)
RUN chmod +x /app/entrypoint.sh && chown appuser:appgroup /app/entrypoint.sh

# 7. PRZEŁĄCZENIE NA UŻYTKOWNIKA
USER appuser

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "project_config.wsgi:application", "--worker-tmp-dir", "/app/tmp"]
