import jwt from "jsonwebtoken"
import registerRoomEvents from "./handlers/room.socket.js";
import { COOKIE_NAME } from "../middleware/cookie.middleware.js";

// Middleware d'authentification du socket. Même principe que authenticate pour les routes
// HTTP, mais joué une seule fois, à l'ouverture du transport.
// Sans lui, n'importe qui pouvait ouvrir une connexion Socket.IO et demander à rejoindre la
// salle d'un projet dont il n'est pas membre, donc recevoir en direct ses bugs et son journal.
// Lecture d'un cookie dans l'en-tête brut du handshake.
// Écrite ici plutôt qu'ajoutée en dépendance : c'est quatre lignes, et les noms
// exportés par la bibliothèque cookie ont déjà changé d'une version à l'autre.
const lireCookie = (entete, nom) => {
  if (!entete) return undefined;

  const trouve = entete
    .split(';')
    .map((morceau) => morceau.trim().split('='))
    .find(([cle]) => cle === nom);

  return trouve ? decodeURIComponent(trouve.slice(1).join('=')) : undefined;
};

export const authenticateSocket = (socket, next) => {
  // Le jeton vient du cookie httpOnly, exactement comme pour les routes HTTP.
  // Socket.IO ne décode pas les cookies lui-même : l'en-tête brut du handshake est
  // analysé ici. Côté navigateur, il suffit que la connexion soit ouverte avec
  // withCredentials pour que le cookie parte.
  const token = lireCookie(socket.handshake.headers?.cookie, COOKIE_NAME);

  if (!token) {
    return next(new Error("Accès refusé 🔒"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error("Token invalide ou expiré ❌"));
    }
    // L'identité vient du jeton et de nulle part ailleurs : un client ne peut plus
    // se faire passer pour un autre utilisateur en trafiquant les données qu'il envoie.
    socket.data.user = decoded;
    next();
  });
};

export default function configureSocket(io) {
  // Toute connexion passe par la vérification du jeton avant d'atteindre "connection"
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    // Salle personnelle "user_<id>", rejointe automatiquement à partir du jeton — permet de
    // notifier un utilisateur directement, même s'il n'est pas encore dans la salle d'un
    // projet donné (ex: acceptation d'une demande d'adhésion). Rejouée à chaque reconnexion.
    socket.join(`user_${socket.data.user.id}`);

    // Enregistrement des événements pour la gestion des salles de projet (room)
    registerRoomEvents(io, socket);
    console.log(`Socket connected: ${socket.id}`);
    console.log(`Connected sockets: ${io.engine.clientsCount}`);
  });
}
