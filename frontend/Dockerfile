# Etapa 1: Construcción
FROM node:20-alpine AS build

WORKDIR /app

# Copia archivos de dependencias
COPY package*.json ./
RUN npm install

# Copia el código fuente
COPY . .

# Construye la aplicación
RUN npm run build

# Etapa 2: Servidor de producción
FROM nginx:stable-alpine

# Copia los archivos construidos desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copia una configuración básica de nginx para manejar el routing de SPA
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
