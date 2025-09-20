# frontend/Dockerfile (multi-stage)
FROM node:18-alpine AS build
WORKDIR /usr/src/app

COPY package*.json ./
COPY package-lock.json ./
RUN npm ci

COPY . .

# pass build-time variable to Vite by using ARG then ENV
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:stable-alpine AS production
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
