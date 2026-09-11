import jwt from "jsonwebtoken"
import registerRoomEvents from "./handlers/room.socket.js";

// Middleware d'authentification du socket. Même principe que authenticate pour les routes
// HTTP, mais joué une seule fois, à l'ouverture du transport.
// Sans lui, n'importe qui pouvait ouvrir une connexion Socket.IO et demander à rejoindre la
// salle d'un projet dont il n'est pas membre, donc recevoir en direct ses bugs et son journal.
export const authenticateSocket = (socket, next) => {
  // Le jeton est transmis dans le handshake, pas dans un en-tête : c'est le canal prévu
  // par Socket.IO pour l'authentification (socket.auth côté client).
  const token = socket.handshake.auth?.token;

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
