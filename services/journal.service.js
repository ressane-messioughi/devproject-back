import journalModel from '../models/journal.model.js'

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
// Fonction pour supprimer un message
const deleteMessage = async (id_journal) => {
    const result = await journalModel.remove(id_journal)
    return result;
}
export default {
    getProjectMessage,
    createMessage,
    deleteMessage
}