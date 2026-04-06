# production stage
FROM nginx:stable-alpine AS production-stage

# Удаляем всё дефолтное
RUN rm -rf /etc/nginx/conf.d/* /usr/share/nginx/html/*

# Копируем Vue билд
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Копируем конфиг (это самый надёжный способ)
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

RUN ls -la /usr/share/nginx/html && \
    ls -la /etc/nginx/conf.d/ && \
    cat /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
