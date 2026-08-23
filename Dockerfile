# Image de depart : Node.js version 22, en version "alpine" (une distribution
# Linux minimale, ~50 Mo au lieu de ~1 Go).
FROM node:22-alpine

# Dossier de travail a l'interieur du conteneur. Toutes les commandes qui
# suivent s'executent depuis ce dossier.
WORKDIR /app

# On copie d'abord les deux fichiers de dependances, et seulement eux.
# Docker garde en cache le resultat de chaque instruction : tant que ces deux
# fichiers ne changent pas, il ne refait pas le npm ci ci-dessous.
COPY package.json package-lock.json ./

# Le script "prepare" du projet lance Husky, qui installe les hooks git.
# Dans un conteneur il n'y a pas de depot git et aucun commit n'y sera fait :
# on retire ce script avant l'installation, sinon npm s'arrete en erreur.
RUN npm pkg delete scripts.prepare

# npm ci installe exactement les versions du package-lock.
# --omit=dev laisse de cote les outils qui ne servent qu'au developpement.
RUN npm ci --omit=dev

# On copie le reste du code (ce qui change souvent : donc apres l'installation)
COPY . .

# Documente le port que l'application ecoute. C'est purement informatif.
EXPOSE 3000

# La commande lancee au demarrage du conteneur.
CMD ["node", "server.js"]
