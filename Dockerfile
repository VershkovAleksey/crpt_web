# ====================== BUILD STAGE ======================
FROM node:lts-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN ls -la /app/dist

# ====================== PRODUCTION STAGE ======================
FROM nginx:stable-alpine AS production-stage

# Удаляем всё дефолтное
RUN rm -rf /etc/nginx/conf.d/* /usr/share/nginx/html/*

# Копируем собранное Vue приложение
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Копируем nginx конфиг
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Проверка того, что всё скопировалось
RUN ls -la /usr/share/nginx/html && \
    ls -la /etc/nginx/conf.d/ && \
    echo "=== default.conf content ===" && \
    cat /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
