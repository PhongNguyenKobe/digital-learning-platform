FROM node:22-bookworm-slim

WORKDIR /app

# PDF cover/text extraction and malware scanning run inside the API container.
RUN apt-get update \
  && apt-get install -y --no-install-recommends clamav clamav-freshclam poppler-utils \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN mkdir -p /app/uploads/thumbnails && chmod +x /app/docker-entrypoint.sh

ENV NODE_ENV=production
ENV UPLOAD_DIR=/app/uploads

EXPOSE 3000
CMD ["/app/docker-entrypoint.sh"]
