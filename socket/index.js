import registerRoomEvents from "./handlers/room.socket.js";

export default function configureSocket(io) {
  io.on("connection", (socket) => {
    console.log(`Socket connecté : ${socket.id}`);
    // Enregistrement des événements pour la gestion des salles de projet (room)
    registerRoomEvents(io, socket);
  });
}