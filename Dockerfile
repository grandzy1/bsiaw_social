FROM node:20-alpine

# Ustaw katalog roboczy
WORKDIR /app

# Skopiuj package files
COPY package*.json ./

# Zainstaluj zależności
RUN npm ci

# Skopiuj resztę aplikacji
COPY . .

# Stwórz użytkownika nextjs
RUN chown -R nextjs:nextjs /app

# Expose port
EXPOSE 3000

# Ustaw użytkownika o niższych uprawnieniach dla bezpieczeństwa
USER nextjs

# Uruchom w trybie development
CMD ["npm", "run", "dev"]