# Usa una imagen base oficial de Node.js
FROM node:14

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el package.json y el package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de la aplicación
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Usa una imagen base de servidor web
FROM nginx:alpine

# Copia los archivos de build al directorio de Nginx
COPY --from=0 /app/dist /usr/share/nginx/html

# Expone el puerto en el que la aplicación estará corriendo
EXPOSE 80

# Comando para correr Nginx
CMD ["nginx", "-g", "daemon off;"]
