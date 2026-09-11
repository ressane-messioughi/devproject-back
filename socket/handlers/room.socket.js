import { connectedUsers } from "../state/userOnline.socket.js";
import teamModel from "../../models/team.model.js";

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

// Fonction pour vérifier que l'utilisateur fait bien partie de l'équipe du projet.
// C'est l'équivalent temps réel du contrôle d'accès des routes HTTP : appartenir au
// projet est la condition pour en recevoir les évènements.
// Renvoie la ligne team_user quand la personne est membre, null sinon — le team_role
// qu'elle contient sert à afficher le badge de rôle dans la barre des membres en ligne.
async function getProjectMembership(user_id, id_project) {
  const team = await teamModel.findByProjectId(id_project);
  if (!team) return null;

  const userRole = await teamModel.getUserRole(user_id, team.id_team);
  return userRole || null;
}

export default function registerRoomEvents(io, socket) {
  // L'utilisateur du socket vient du jeton vérifié dans socket/index.js
  const user = socket.data.user;

  socket.on("joinProjectRoom", async ({ id_project } = {}) => {
      if (!id_project) return;

      // Contrôle d'accès : sans lui, un client pouvait rejoindre la salle de n'importe
      // quel projet en envoyant simplement son identifiant.
      const membre = await getProjectMembership(user.id, id_project);
      if (!membre) return;

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
          team_role: membre.team_role,
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

  // On ne renvoie la liste que pour la salle où l'utilisateur se trouve réellement
  if (socket.data.room !== room) {
    return socket.emit("connectedUsers", []);
  }

  socket.emit("connectedUsers", connectedUsers[room] || []);
});

// Diffusion d'un changement de photo de profil à tous les membres de la salle actuelle
socket.on("avatarUpdated", ({ avatar }) => {
  const room = socket.data.room;
  if (!room || !avatar) return;

  // L'identifiant vient du jeton : personne ne peut changer l'avatar affiché d'un autre membre
  const user_id = user.id;

  if (connectedUsers[room]) {
    const entry = connectedUsers[room].find((item) => item.id === user_id);
    if (entry) {
      entry.avatar = avatar;
      io.to(room).emit("connectedUsers", connectedUsers[room]);
    }
  }

  io.to(room).emit("avatarUpdated", { user_id, avatar });
});

  // Coupure du transport, quelle qu'en soit la cause (onglet fermé, réseau perdu,
  // déconnexion volontaire) : Socket.IO émet toujours "disconnect", c'est donc ici que
  // le nettoyage de connectedUsers doit se faire.
  socket.on("disconnect", () => {
    leaveCurrentRoom(io, socket);
  });

}
