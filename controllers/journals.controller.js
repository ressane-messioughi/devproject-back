import journalService from "../services/journal.service.js";
import socketService from "../services/socket.service.js";
import teamModel from "../models/team.model.js";

// Fonction pour récupérer les messages d'un projet
const getProjectMessage = async (req, res) => {
    const {id_project} = req.params
    const result = await journalService.getProjectMessage(id_project)
    return res.status(200).json(result)
};

// Fonction pour créer un message dans le journal d'un projet
const createMessage = async (req, res) => {
    const {title, message} = req.body;
    const {id_project} = req.params;
    const users_id = req.user.id;
    const user = req.user
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
    return res.status(201).json({result, message : 'Message créer avec succès !'}) 
};

// Fonction pour modifier un message du journal d'un projet
const updateMessage = async (req, res) => {
    const { id_journal } = req.params;
    const { title, message } = req.body;
    const users_id = req.user.id;
    const result = await journalService.updateMessage(id_journal, users_id, title, message);
    return res.status(200).json({ message: 'Message modifié avec succès !', result });
};

// Fonction pour supprimer un message du journal d'un projet
const deleteMessage = async (req,res) => {
    const {id_project, id_journal} = req.params;
    const users_id = req.user.id;
    const result = await journalService.deleteMessage(id_journal, id_project, users_id);
    return res.status(200).json({message : "Message supprimé avec succès !", result});
};
export default {
    getProjectMessage,
    createMessage,
    updateMessage,
    deleteMessage
}