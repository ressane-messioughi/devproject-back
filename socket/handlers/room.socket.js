import { connectedUsers } from "../state/userOnline.socket.js";
import teamModel from "../../models/team.model.js";

// Departs en attente de confirmation, par salle et par utilisateur.
//
// Rafraichir une page coupe le socket puis en rouvre un aussitot. Sans ce sursis,
// l equipe voit la personne partir puis revenir a chaque rafraichissement, et recoit
// une notification a chaque fois. On attend donc quelques secondes avant de la retirer
// vraiment : si elle revient entre-temps, rien n a bouge aux yeux des autres.
const departsEnAttente = new Map();
const DELAI_DE_GRACE = 8000;

const cleDepart = (room, userId) => `${room}:${userId}`;

// Fonction pour savoir si un utilisateur a encore un socket vivant dans la salle.
// Elle sert au moment ou le sursis expire : quelqu un peut avoir deux onglets ouverts,
// en fermer un, et rester present par l autre.
function encorePresent(io, room, userId) {
  const sockets = io.sockets.adapter.rooms.get(room);
  if (!sockets) return false;

  for (const id of sockets) {
    if (io.sockets.sockets.get(id)?.data?.userId === userId) return true;
  }
  return false;
}

// Fonction pour retirer reellement un utilisateur de la liste des presents
function retirerDesPresents(io, room, userId) {
  if (!connectedUsers[room]) return;

  connectedUsers[room] = connectedUsers[room].filter((user) => user.id !== userId);
  io.to(room).emit("connectedUsers", connectedUsers[room]);
}

// Fonction pour faire quitter à un socket la salle dans laquelle il se trouve.
//
// "immediat" distingue les deux façons de partir. Changer de projet ou se déconnecter est
// un départ voulu : la personne disparaît tout de suite de la liste. Une coupure de
// transport — rafraîchissement, réseau, mise en veille — n'en est pas un : on laisse un
// sursis avant de la retirer.
function leaveCurrentRoom(io, socket, { immediat = false } = {}) {
  const room = socket.data.room;
  const userId = socket.data.userId;

  if (!room || !userId) return;

  socket.leave(room);
  socket.data.room = null;
  socket.data.userId = null;

  if (immediat) {
    retirerDesPresents(io, room, userId);
    return;
  }

  const cle = cleDepart(room, userId);
  clearTimeout(departsEnAttente.get(cle));

  departsEnAttente.set(
    cle,
    setTimeout(() => {
      departsEnAttente.delete(cle);

      // Un autre onglet peut avoir pris le relais entre-temps
      if (!encorePresent(io, room, userId)) {
        retirerDesPresents(io, room, userId);
      }
    }, DELAI_DE_GRACE),
  );
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

      // Retour avant la fin du sursis : la personne n'est jamais vraiment partie, on
      // annule son retrait. C'est ce qui évite une notification à chaque rafraîchissement.
      const cle = cleDepart(room, user.id);
      if (departsEnAttente.has(cle)) {
        clearTimeout(departsEnAttente.get(cle));
        departsEnAttente.delete(cle);
      }

      // CORRECTIF : si l'utilisateur était déjà dans une autre salle (changement de projet),
      // on le fait proprement en sortir avant de le faire rejoindre la nouvelle, sinon il
      // reste "connecté" pour toujours dans l'ancien projet aux yeux des autres membres.
      // Changer de projet est un départ voulu, donc immédiat.
      if (socket.data.room && socket.data.room !== room) {
        leaveCurrentRoom(io, socket, { immediat: true });
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

 // Départ voulu : changement de projet ou déconnexion. Aucun sursis.
 socket.on("leaveProjectRoom", () => {
   leaveCurrentRoom(io, socket, { immediat: true });
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

  // Coupure du transport, quelle qu'en soit la cause : onglet fermé, réseau perdu,
  // rafraîchissement. Impossible de distinguer les trois ici, d'où le sursis : on attend
  // quelques secondes avant de retirer la personne de la liste.
  socket.on("disconnect", () => {
    leaveCurrentRoom(io, socket);
  });

}
