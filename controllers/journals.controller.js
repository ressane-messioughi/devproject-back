import journalService from "../services/journal.service.js";
import socketService from "../services/socket.service.js";
import teamModel from "../models/team.model.js";
import cloudinary from "../config/cloudinary.js";
import { sanitizeHtml } from "../utils/sanitizeHtml.js";

// Fonction pour récupérer les messages d'un projet
const getProjectMessage = async (req, res) => {
    const {id_project} = req.params
    const result = await journalService.getProjectMessage(id_project)
    return res.status(200).json(result)
};

// Fonction pour créer un message dans le journal d'un projet
const createMessage = async (req, res) => {
    const {title} = req.body;
    const {id_project} = req.params;
    const users_id = req.user.id;
    const user = req.user

    // Le message contient de la mise en forme saisie par l'utilisateur. Le navigateur la
    // nettoie deja avant l'envoi, mais un appel direct a l'API contournerait le
    // formulaire : le serveur est le seul endroit ou la regle ne peut pas etre evitee.
    const message = sanitizeHtml(req.body.message);

    const result = await journalService.createMessage(title, message, id_project, users_id);

    // Récupération du team_role de l'auteur pour l'affichage du badge en temps réel
    const team = await teamModel.findByProjectId(id_project);
    const teamUser = team ? await teamModel.getUserRole(users_id, team.id_team) : null;

    // Création d'un objet représentant le nouveau message pour l'émission via Socket.IO
    const newMessage = {
    id_journal: result.insertId,
    title,
    message,
    project_id: id_project,
    users_id,
    created_at: new Date(),
    username: req.user.username,
    avatar: req.user.avatar,
    team_role: teamUser?.team_role || null,
  };
  socketService.newJournalMessage(id_project, newMessage)
  socketService.journalNotifyTeam(id_project, user, title)
// Mise à jour du composant Journal en temps réel pour tous les utilisateurs connectés au projet
    return res.status(201).json({result, message : 'Message créé avec succès !'}) 
};

// Fonction pour modifier un message du journal d'un projet
const updateMessage = async (req, res) => {
    const { id_journal } = req.params;
    const { title, message } = req.body;
    const users_id = req.user.id;
    const result = await journalService.updateMessage(id_journal, users_id, title, sanitizeHtml(message));
    return res.status(200).json({ message: 'Message modifié avec succès !', result });
};

// Fonction pour supprimer un message du journal d'un projet
const deleteMessage = async (req,res) => {
    const {id_project, id_journal} = req.params;
    const users_id = req.user.id;
    const result = await journalService.deleteMessage(id_journal, id_project, users_id);
    return res.status(200).json({message : "Message supprimé avec succès !", result});
};
// Fonction pour envoyer une image à insérer dans le corps d'un message.
// Rien n'est enregistré en base : seule l'adresse revient au navigateur, qui la place
// dans le texte. C'est le message qui la porte ensuite.
const uploadImage = async (req, res) => {
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'devproject/journal' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(req.file.buffer);
  });

  return res.status(201).json({ message: 'Image envoyée', url: uploadResult.secure_url });
};

export default {
    getProjectMessage,
    createMessage,
    uploadImage,
    updateMessage,
    deleteMessage
}