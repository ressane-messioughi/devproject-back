import journalModel from '../models/journal.model.js'
import teamModel from '../models/team.model.js'
import AppError from '../middleware/AppError.js'

// Fonction pour récupérer tous les messages d'un projet
const getProjectMessage = async (project_id) => {
    const result = await journalModel.findAllByProject(project_id);
    return result
}
// Fonction pour créer un message
const createMessage = async (title,message,project_id, users_id) => {
    const result = await journalModel.create(title,message, project_id, users_id);
    return result;
}
// Fonction pour modifier un message (uniquement l'auteur)
const updateMessage = async (id_journal, requester_id, title, message) => {
    const post = await journalModel.findById(id_journal);
    if (!post) {
        throw new AppError("Message introuvable", 404)
    }
    if (post.users_id !== requester_id) {
        throw new AppError("Vous ne pouvez modifier que vos propres messages", 403)
    }
    const result = await journalModel.update(id_journal, title, message);
    return result;
}
// Fonction pour supprimer un message (l'auteur ou le owner du projet)
const deleteMessage = async (id_journal, id_project, requester_id) => {
    const post = await journalModel.findById(id_journal);
    if (!post) {
        throw new AppError("Message introuvable", 404)
    }
    if (post.users_id !== requester_id) {
        const team = await teamModel.findByProjectId(id_project);
        const requesterRole = team ? await teamModel.getUserRole(requester_id, team.id_team) : null;
        if (!requesterRole || requesterRole.role !== 'OWNER') {
            throw new AppError("Vous ne pouvez supprimer que vos propres messages", 403)
        }
    }
    const result = await journalModel.remove(id_journal)
    return result;
}
export default {
    getProjectMessage,
    createMessage,
    updateMessage,
    deleteMessage
}