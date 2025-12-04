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
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Expose port
EXPOSE 3000

# Ustaw użytkownika o niższych uprawnieniach dla bezpieczeństwa
USER nextjs

# Uruchom w trybie development
CMD ["npm", "run", "dev"]