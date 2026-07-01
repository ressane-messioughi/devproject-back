import bugsModel from "../models/bugs.model.js";

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
// Fonction pour mettre à jour un bug
const updateBug = async (id_bug,title, description, status, file_url) => {
    const result = await bugsModel.update(id_bug,title, description, status, file_url)
    return result
}
// Fonction pour supprimer un bug
const deleteBug = async (id_bug) => {
    const result = await bugsModel.remove(id_bug);
    return result
}
export default {
    getProjectBug,
    createBug,
    updateBug,
    deleteBug
}