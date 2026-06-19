import taskModel from "../models/task.model.js"

const getAll = async () => {
    const result = await taskModel.findAll();
    return result
}
const getById = async (id_project, id_task) => {
    const result = await taskModel.findById(id_project, id_task);
    return result
}
const createTask = async (id_project, title, description, status)