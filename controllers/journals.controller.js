import journalService from "../services/journal.service.js";

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
    const result = await journalService.createMessage(title, message, id_project, users_id);

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
  };
    const io = req.app.get("io");
// Mise à jour du composant Journal en temps réel pour tous les utilisateurs connectés au projet
io.to(`project_${id_project}`).emit("newJournalMessage", newMessage); 
// Notification en temps réel pour tous les utilisateurs connectés au projet lorsqu'un nouveau message est créé
io.to(`project_${id_project}`).emit("journalNotification", {
    // Informations sur le nouveau message pour la notification
  project_id: id_project,
  username: req.user.username,
  avatar: req.user.avatar,
  title,
});


    return res.status(201).json({result, message : 'Message créer avec succès !'}) 
};

// Fonction pour supprimer un message du journal d'un projet
const deleteMessage = async (req,res) => {
    const {id_journal} = req.params;
    const result = await journalService.deleteMessage(id_journal);
    return res.status(200).json({message : "Message supprimé avec succès !", result});
};
export default {
    getProjectMessage,
    createMessage,
    deleteMessage
}