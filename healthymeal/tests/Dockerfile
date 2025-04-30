FROM node:18-alpine

WORKDIR /app

# Instalacja zależności dla Cypress
RUN apk add --no-cache \
    libstdc++ \
    libgcc \
    libc6-compat \
    eudev \
    xvfb \
    ttf-freefont \
    chromium \
    harfbuzz \
    nss \
    freetype \
    fontconfig

# Zmienne środowiskowe dla Cypress
ENV CYPRESS_CACHE_FOLDER=/root/.cache/Cypress \
    CYPRESS_INSTALL_BINARY=0 \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    CHROME_BIN=/usr/bin/chromium-browser

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "test:all"] 