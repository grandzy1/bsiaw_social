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
#CMD ["npm", "run", "dev"]

# Deklaracja argumentu do przekazania przy budowaniu (docker build --build-arg <domena/ip>)
ARG NEXT_PUBLIC_API_URL

# Przypisanie zmiennej środowiskowej z adresem load balancera/domena strony
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Skompiluj projekt aby moc uruchomic serwer produkcyjny
RUN npm run build

# Uruchom w trybie produkcyjnym
CMD ["npm", "run", "start"]
