import { connectedUsers } from "../state/userOnline.socket.js";

// Fonction pour faire quitter à un socket la salle dans laquelle il se trouve actuellement
// (retire l'utilisateur de connectedUsers et prévient les autres membres de la salle)
function leaveCurrentRoom(io, socket) {
  const room = socket.data.room;
  const userId = socket.data.userId;

  if (!room || !userId) return;

  if (connectedUsers[room]) {
    connectedUsers[room] = connectedUsers[room].filter(
      (user) => user.id !== userId
    );
    io.to(room).emit("connectedUsers", connectedUsers[room]);
  }

  socket.leave(room);
  socket.data.room = null;
  socket.data.userId = null;
}

export default function registerRoomEvents(io, socket) {

// Salle personnelle "user_<id>", rejointe dès la connexion (indépendamment de tout projet
// sélectionné) — permet de notifier un utilisateur directement, même s'il n'est pas encore
// dans la salle d'un projet donné (ex: acceptation d'une demande d'adhésion).
socket.on("identify", ({ user_id }) => {
  if (!user_id) return;
  socket.join(`user_${user_id}`);
});

  socket.on("joinProjectRoom", (data) => {
      const { id_project, user } = data || {};
      if (!id_project || !user) return;

      const room = `project_${id_project}`;

      // CORRECTIF : si l'utilisateur était déjà dans une autre salle (changement de projet),
      // on le fait proprement en sortir avant de le faire rejoindre la nouvelle, sinon il
      // reste "connecté" pour toujours dans l'ancien projet aux yeux des autres membres.
      if (socket.data.room && socket.data.room !== room) {
        leaveCurrentRoom(io, socket);
      }

      socket.join(room);

      socket.data.room = room;
      socket.data.userId = user.id;

      if (!connectedUsers[room]) {
        connectedUsers[room] = [];
      }

      const alreadyExist = connectedUsers[room].find(
        (item) => item.id === user.id
      );

      if (!alreadyExist) {
        connectedUsers[room].push({
          id: user.id,
          username: user.username,
          avatar: user.avatar,
        });
        socket.to(room).emit("userConnected", {
      username: user.username,
      avatar: user.avatar,
        });
      }


      io.to(room).emit("connectedUsers", connectedUsers[room]);
    });

 socket.on("leaveProjectRoom", () => {
   leaveCurrentRoom(io, socket);
 });

 socket.on("getConnectedUsers", ({ id_project }) => {
  const room = `project_${id_project}`;

  socket.emit("connectedUsers", connectedUsers[room] || []);
});

// Diffusion d'un changement de photo de profil à tous les membres de la salle actuelle
socket.on("avatarUpdated", ({ user_id, avatar }) => {
  const room = socket.data.room;
  if (!room || !user_id || !avatar) return;

  if (connectedUsers[room]) {
    const entry = connectedUsers[room].find((item) => item.id === user_id);
    if (entry) {
      entry.avatar = avatar;
      io.to(room).emit("connectedUsers", connectedUsers[room]);
    }
  }

  io.to(room).emit("avatarUpdated", { user_id, avatar });
});

  socket.on("disconnect", () => {
    leaveCurrentRoom(io, socket);
  });

}