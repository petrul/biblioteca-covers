FROM node:24-slim

ENV CHROME_PATH=/usr/bin/chromium
WORKDIR /app

# Fonts for the glyphs the layouts draw as text: fonts-liberation has none
# of them, so headless Chromium drew empty boxes. fonts-dejavu-core: the
# ornaments ❧ ❦ (WoodcutBroadside, PureTypographic) and stars ✦ ★;
# fonts-noto-color-emoji: ✨ (StorybookWhimsy).
RUN apt-get update \
    && apt-get install --yes --no-install-recommends chromium ca-certificates fonts-liberation fonts-dejavu-core fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
# The thumbnail cache's default directory, owned by node so a Docker volume
# mounted there starts out writable.
RUN mkdir -p /app/.cache/thumbnails && chown -R node:node /app/.cache
USER node
EXPOSE 3335
ENV PORT=3335

CMD ["npm", "start"]
