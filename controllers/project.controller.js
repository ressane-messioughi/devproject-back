import projectService from "../services/project.service.js";

const getAllProject = async (req,res) => {
    const result = await projectService.getAll();
    return res.status(201).json(result)
}
const getProjectById = async (req,res) => {
    const {id_project} = req.params;
    const result = await projectService.getById(id_project);
    return res.status(201).json(result)
}
const getMyProject = async (req,res) => {
    const user_id = req.user.id
    const project = await projectService.getMyProjects(user_id)
    return res.status(200).json(project)
}
const createProject = async (req,res) => {
    const  owner_id = req.user.id
    const {name, description} = req.body 
    const result = await projectService.createProject(name,description,owner_id)
    return res.status(200).json({result, message : "Projet créer avec succès !"})
}
const updateProject = async (req,res) => {
    const {id_project} = req.params
    const {name, description} = req.body
    const result = await projectService.updateProject(name, description,id_project);
    return res.status(200).json({result, message: "Projet mise à jour"}) 
}
const removeProject = async (req, res) => {
    const {id_project} = req.params
    const result = await projectService.deleteProject(id_project);
    return res.status(201).json({result, message: "Projet supprimé avec succès"}) 
}
export default {
    getAllProject,
    getProjectById,
    getMyProject,
    createProject,
    updateProject,
    removeProject
};