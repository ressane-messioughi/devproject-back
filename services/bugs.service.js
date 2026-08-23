import bugsModel from "../models/bugs.model.js";
import AppError from "../middleware/AppError.js";

// Fonction pour récupérer tous les bugs d'un projet
const getProjectBug = async (project_id) => {
    const result = await bugsModel.findAllByProject(project_id);
    return result
}
// Fonction pour créer un bug
const createBug = async (title, description, status, file_url, project_id, created_by) => {
    const result = await bugsModel.create(title, description, status, file_url, project_id, created_by);
    return result
}
// Fonction pour modifier le titre et la description d'un bug (uniquement l'auteur)
const updateBug = async (id_bug, requester_id, title, description) => {
    const bug = await bugsModel.findById(id_bug);
    if (!bug) {
        throw new AppError("Bug introuvable", 404)
    }
    if (bug.created_by !== requester_id) {
        throw new AppError("Vous ne pouvez modifier que vos propres bugs", 403)
    }
    const result = await bugsModel.updateDetails(id_bug, title, description)
    return result
}
// Fonction pour changer le statut d'un bug (n'importe quel membre de l'équipe)
const updateBugStatus = async (id_bug, status, updated_by) => {
    const result = await bugsModel.updateStatus(id_bug, status, updated_by);
    return result
}
// Fonction pour supprimer un bug (uniquement le owner du projet, vérifié par le middleware isProjectOwner)
const deleteBug = async (id_bug) => {
    const result = await bugsModel.remove(id_bug);
    return result
}
export default {
    getProjectBug,
    createBug,
    updateBug,
    updateBugStatus,
    deleteBug
}
