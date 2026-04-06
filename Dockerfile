# build stage
FROM node:lts-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production=false
COPY . .
RUN npm run build
RUN ls -la /app/dist

# production stage
FROM nginx:stable-alpine AS production-stage

# Удаляем всё дефолтное, чтобы не было конфликтов
RUN rm -rf /etc/nginx/conf.d/*

# Копируем собранное Vue-приложение
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Копируем наш конфиг (ВАЖНО: именно в /etc/nginx/conf.d/default.conf)
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Проверяем что всё скопировалось
RUN ls -la /usr/share/nginx/html && \
    ls -la /etc/nginx/conf.d/ && \
    cat /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
