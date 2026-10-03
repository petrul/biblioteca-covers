FROM node:24-slim

ENV CHROME_PATH=/usr/bin/chromium
WORKDIR /app

RUN apt-get update \
    && apt-get install --yes --no-install-recommends chromium ca-certificates fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
USER node
EXPOSE 3335
ENV PORT=3335

CMD ["npm", "start"]
