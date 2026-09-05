import projectService from '../services/project.service.js';
import socketService from '../services/socket.service.js';

// Fonction pour récupérer tous les projets
const getAllProject = async (req, res) => {
  const result = await projectService.getAll();
  return res.status(200).json(result);
};
// Fonction pour récupérer un projet par son ID
const getProjectById = async (req, res) => {
  const { id_project } = req.params;
  const result = await projectService.getById(id_project);
  return res.status(200).json(result);
};
// Fonction pour récupérer les projets d'un utilisateur
const getMyProject = async (req, res) => {
  const user_id = req.user.id;
  const project = await projectService.getMyProjects(user_id);
  return res.status(200).json(project);
};
// Fonction pour créer un projet
const createProject = async (req, res) => {
  const owner_id = req.user.id;
  const { name, description, trello_url } = req.body;
  const result = await projectService.createProject(name, description, owner_id, trello_url);
    const newProject = {
    project_id: result.id_project,
    name,
    description,
    trello_url,
    owner_id: result.owner_id
  };
  socketService.newProjectList(newProject)
  return res.status(201).json({ result, message: 'Projet créé avec succès !' });
};
// Fonction pour mettre à jour un projet
const updateProject = async (req, res) => {
  const { id_project } = req.params;
  const { name, description } = req.body;
  const result = await projectService.updateProject(name, description, id_project);
  return res.status(200).json({ result, message: 'Projet mis à jour' });
};
// Fonction pour supprimer un projet (req.team fourni par le middleware isProjectOwner)
const removeProject = async (req, res) => {
  const { id_project } = req.params;
  const result = await projectService.deleteProject(id_project, req.team);
  return res.status(200).json({ result, message: 'Projet supprimé avec succès' });
};
export default {
  getAllProject,
  getProjectById,
  getMyProject,
  createProject,
  updateProject,
  removeProject,
};
