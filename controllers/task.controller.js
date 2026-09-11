import taskService from "../services/task.service.js";
import socketService from "../services/socket.service.js";

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

    const newTask = {
        id_task: result.insertId,
        title,
        description,
        status,
        assigned_to: Number(assigned_to),
        sprint_id: sprint_id ? Number(sprint_id) : null,
        project_id: Number(id_project),
        created_at: new Date(),
    };
    socketService.newTask(id_project, newTask);
    // Notification adressee a la seule personne concernee, via sa salle personnelle
    socketService.taskAssignedNotify(assigned_to, req.user, title);

    return res.status(201).json({result, message : "Tâche créée avec succès !"})
}
// Fonction pour mettre à jour une tache
const updateTask = async (req, res) => {
    const {id_project, id_task} = req.params;
    const {title,description,status,assigned_to,sprint_id} = req.body
    const result = await taskService.updateTask(id_task,title,description,status,assigned_to,sprint_id)

    socketService.taskUpdated(id_project, {
        id_task: Number(id_task),
        title,
        description,
        status,
        assigned_to: Number(assigned_to),
        sprint_id: sprint_id ? Number(sprint_id) : null,
    });

    return res.status(200).json({message: "Tâche modifiée avec succès !", result})
}
// Fonction pour supprimer une tache
const deleteTask = async (req, res) => {
const {id_project, id_task} = req.params
const result = await taskService.deleteTask(id_task)

socketService.taskDeleted(id_project, Number(id_task));

return res.status(200).json({message : "Tâche supprimée avec succès !", result})
}
export default {
    getProjectTasks,
    createTask,
    updateTask,
    deleteTask
}
