import sprintModel from "../models/sprint.model.js";

// Fonction pour récupérer tous les sprints d'un projet
const getProjectSprints = async (project_id) => {
    const result = await sprintModel.findAllByProject(project_id);
    return result
} 

// Fonction pour créer un sprint
const createSprint = async (name, start_date, end_date, status, project_id) => {
    const result = await sprintModel.create(name, start_date, end_date, status, project_id);
    return result 
}

// Fonction pour mettre à jour un sprint
const updateSprint = async (id_sprint ,name, start_date, end_date, status) => {
    const result = await sprintModel.update(id_sprint ,name, start_date, end_date, status)
    return result
}

// Fonction pour supprimer un sprint
const deleteSprint = async (id_sprint) => {
    const result = await sprintModel.remove(id_sprint);
    return result 
} 
export default {
    getProjectSprints,
    createSprint,
    updateSprint,
    deleteSprint
}