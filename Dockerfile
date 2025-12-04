FROM node:20-alpine

# Ustaw katalog roboczy
WORKDIR /app

# Skopiuj package files
COPY package*.json ./

# Zainstaluj zależności
RUN npm ci

# Skopiuj resztę aplikacji
COPY . .

# Expose port
EXPOSE 3000

# Uruchom w trybie development
CMD ["npm", "run", "dev"]