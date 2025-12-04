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

# Skompiluj projekt
RUN npm run build

# Uruchom w trybie produkcyjnym
CMD ["npm", "run", "start"]