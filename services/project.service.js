import projectModel from '../models/project.model.js'

const getAll = async () => {
 const result = await projectModel.findAll();
 return result 
}
const getById = async (id) => {
    const result = await projectModel.findById(id)
    return result 
}
const createProject = async (name,description,owner_id) => {
    const result = await projectModel.create(name,description,owner_id)
    return result
}
const updateProject = async (id, {name,description}) => {
const result = await projectModel.update(name,description,id);
return result;
}
const deleteProject = async (id) => {
    const result = await projectModel.remove(id)
    return result
}
export default {
    getAll,
    getById,
    createProject,
    updateProject,
    deleteProject
}