FROM node:22
WORKDIR /client
COPY ./package*.json ./
RUN npm install
RUN npm install -g http-server
COPY . .
RUN npm run build
EXPOSE 8081
CMD ["npm", "run", "test:dev"]