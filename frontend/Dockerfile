# Etapa 1: Construcción
FROM node:20-alpine AS build

# --- AGREGAR ESTO ---
# Definir los argumentos que recibiremos de docker-compose
ARG VITE_API_URL
# Hacer que el argumento esté disponible como variable de entorno durante el build
ENV VITE_API_URL=$VITE_API_URL
# --------------------

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Ahora, cuando ejecute build, llevará consigo las variables de entorno
RUN npm run build

# Etapa 2: Servidor de producción
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Configuración de nginx (tu script de printf está perfecto para SPA)
RUN printf "server { \n\
    listen 80; \n\
    location / { \n\
    root /usr/share/nginx/html; \n\
    index index.html index.htm; \n\
    try_files \$uri \$uri/ /index.html; \n\
    } \n\
    }" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]