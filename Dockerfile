# Etapa de construcción
FROM node:14 as builder

WORKDIR /app

# Instalar dependencias
COPY package.json .
COPY package-lock.json .
RUN npm install

# Construir la aplicación
COPY . .
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Copia los archivos de build al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expone el puerto en el que la aplicación estará corriendo
EXPOSE 80

# Comando para correr Nginx
CMD ["nginx", "-g", "daemon off;"]
