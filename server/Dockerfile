# Image de base Node.js
FROM node:20-alpine

# Créer le dossier de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --production

# Copier tout le reste du code
COPY . .

# Créer le dossier uploads
RUN mkdir -p uploads/logos uploads/recompenses

# Exposer le port
EXPOSE 5000

# Démarrer le serveur
CMD ["node", "index.js"]
