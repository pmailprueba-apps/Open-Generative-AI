FROM node:20-slim

RUN apt-get update && apt-get install -y cron chromium --no-install-recommends && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY post.js semana.js publicar_programado.js post-to-groups.js calendario.json .config.json ./
COPY assets ./assets
COPY contenido ./contenido

RUN echo "0 12 * * * cd /app && /usr/local/bin/node publicar_programado.js > /proc/1/fd/1 2>&1" > /etc/cron.d/aristeus-cron && \
    echo "0 15 * * * cd /app && /usr/local/bin/node publicar_programado.js > /proc/1/fd/1 2>&1" >> /etc/cron.d/aristeus-cron && \
    chmod 0644 /etc/cron.d/aristeus-cron && \
    crontab /etc/cron.d/aristeus-cron && \
    touch /var/log/cron.log

CMD ["cron", "-f"]
