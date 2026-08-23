import registerRoomEvents from "./handlers/room.socket.js";

export default function configureSocket(io) {
  io.on("connection", (socket) => {
    // Enregistrement des événements pour la gestion des salles de projet (room)
    registerRoomEvents(io, socket);
    console.log(`Socket connected: ${socket.id}`);
    console.log(`Connected sockets: ${io.engine.clientsCount}`);
  });
}