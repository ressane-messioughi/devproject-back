import projectService from "../services/project.service.js";

const getAllProject = async (req,res) => {
    const result = await projectService.getAll();
    return res.status(201).json(result)
}
const getProjectById = async (req,res) => {
    const { id_project } = req.params;
    const result = await projectService.getById(id_project);
    return res.status(201).json(result)
}
const createProject = async (req,res) => {
    const  owner_id = req.user.id
    const {name, description} = req.body 
    const result = await projectService.createProject(name,description,owner_id)
    return res.status(200).json({result, message : "Projet créer avec succès !"})
}
const updateProject = async (req,res) => {
    const {id} = req.params
    const {name, description} = req.body
    const result = await projectService.updateProject(name, description,id);
    return res.status(200).json({result, message: "Projet mise à jour"}) 
}
const removeProject = async (req, res) => {
    const id = req.params
    const result = await projectService.deleteProject(id);
    return res.status(201).json({result, message: "Projet supprimé avec succès"}) 
}
export default {
    getAllProject,
    getProjectById,
    createProject,
    updateProject,
    removeProject
};