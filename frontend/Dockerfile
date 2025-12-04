FROM node:20-alpine

# Zaktualizuj npm
# RUN npm install -g npm@latest

# Ustaw katalog roboczy
WORKDIR /app

# Skopiuj package files
COPY package*.json ./

# Zainstaluj zależności
RUN npm ci

# Skopiuj resztę aplikacji
COPY . .

# Stwórz użytkownika nextjs
RUN chown -R node:node /app

# Expose port
EXPOSE 3000

# Ustaw użytkownika o niższych uprawnieniach dla bezpieczeństwa
USER node

# Deklaracja argumentu do przekazania przy budowaniu (docker build --build-arg <domena/ip>)
ARG NEXT_PUBLIC_API_URL

# Przypisanie zmiennej środowiskowej z adresem load balancera/domena strony
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Skompiluj projekt aby moc uruchomic serwer produkcyjny
RUN npm run build

# Uruchom w trybie produkcyjnym
CMD ["npm", "run", "start"]
