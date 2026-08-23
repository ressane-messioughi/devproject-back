import taskService from "../services/task.service.js";

// Fontion pour récupérer les taches d'un projet
const getProjectTasks = async (req, res) => {
    const {id_project} = req.params;
    const result = await taskService.getProjectTasks(id_project);
    return res.status(200).json(result)
}
// Fonction pour créer une tache
const createTask = async (req, res) => {
    const {id_project} = req.params;
    const {title,description,status,assigned_to,sprint_id} = req.body;
    const result = await taskService.createTask(title,description,status,assigned_to,id_project,sprint_id)
    return res.status(201).json({result, message : "Tache créée avec succès !"})
}
// Fonction pour mettre à jour une tache
const updateTask = async (req, res) => {
    const {id_task} = req.params;
    const {title,description,status,assigned_to,sprint_id} = req.body
    const result = await taskService.updateTask(id_task,title,description,status,assigned_to,sprint_id)
    return res.status(200).json({message: "Tache modifiée avec succès !", result})
}
// Fonction pour supprimer une tache
const deleteTask = async (req, res) => {
const {id_task} = req.params
const result = await taskService.deleteTask(id_task)
return res.status(200).json({message : "Tache supprimée avec succès !", result})
}
export default {
    getProjectTasks,
    createTask,
    updateTask,
    deleteTask
}