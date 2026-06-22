import taskService from "../services/task.service.js";

const getProjectTasks = async (req, res) => {
    const {id_project} = req.params;
    const result = await taskService.getProjectTasks(id_project);
    return res.status(200).json(result)
}
const createTask = async (req, res) => {
    const {id_project} = req.params;
    const {title,description,status,assigned_to,sprint_id} = req.body;
    const result = await taskService.createTask(title,description,status,assigned_to,id_project,sprint_id)
    return res.status(201).json({result, message : "Tache créée avec succès !"})
}
const updateTask = async (req, res) => {
    const {id_task} = req.params;
    const {title,description,status,assigned_to,sprint_id} = req.body
    const result = await taskService.updateTask(id_task,title,description,status,assigned_to,sprint_id)
    return res.status(200).json({message: "Tache modifiée avec succès !", result})
}
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