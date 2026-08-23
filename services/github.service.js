import githubModel from "../models/github.model.js";

// Fonction pour récupérer tous les dépôts GitHub d'un projet
const getProjectRepositories = async (project_id) => {
    const result = await githubModel.findAllByProject(project_id);
return result
}
// Fonction pour créer un dépôt GitHub
const createRepository = async (name, url, branch, project_id) => {
    const result = await githubModel.create(name, url, branch, project_id);
return result 
}
// Fonction pour mettre à jour un dépôt GitHub
const updateRepository = async (id_repository, name, url, branch, project_id) => {
    const result = await githubModel.update(id_repository,name, url, branch, project_id);
    return result
}
// Fonction pour supprimer un dépôt GitHub
const deleteRepository = async (id_repository) => {
    const result = await githubModel.remove(id_repository);
    return result
}
export default {
    getProjectRepositories,
    createRepository,
    updateRepository,
    deleteRepository
}