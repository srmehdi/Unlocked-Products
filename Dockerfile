# FROM node:20-alpine
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g netlify-cli@23.14.0
COPY . .

EXPOSE 8888
CMD sh -c "npx netlify dev"