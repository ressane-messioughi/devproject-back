import taskModel from "../models/task.model.js"

// Fonction pour récupérer toutes les tâches d'un projet
const getProjectTasks = async (project_id) => {
const result = await taskModel.findAll(project_id);
return result
}

// Fonction pour créer une tâche
const createTask = async (title, description, status, assigned_to, project_id, sprint_id) => {
const result = await taskModel.create(title, description, status, assigned_to, project_id, sprint_id);
return result
}

// Fonction pour mettre à jour une tâche
const updateTask = async (id_task, title, description, status, assigned_to, project_id, sprint_id) => {
const result = await taskModel.update(id_task, title, description, status, assigned_to, project_id, sprint_id);
return result
}

// Fonction pour supprimer une tâche
const deleteTask = async (id_task) => {
const result = await taskModel.remove(id_task);
return result
}
export default {
    getProjectTasks,
    createTask,
    updateTask,
    deleteTask
}