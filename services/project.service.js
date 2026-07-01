import projectModel from '../models/project.model.js'
import teamModel from '../models/team.model.js';

// Fonction pour générer un code d'équipe unique
const generateTeamCode = () => {
  return "TEAM-" + Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Fonction pour récupérer tous les projets
const getAll = async () => {
 const result = await projectModel.findAll();
 return result 
}

// Fonction pour récupérer un projet par son ID
const getById = async (id_project) => {
    const result = await projectModel.findById(id_project)
    return result 
}

// Fonction pour créer un projet
const createProject = async (name,description,owner_id) => {
    const team_code = generateTeamCode();
    const project = await projectModel.create(name,description,owner_id, team_code)
      const project_id = project.insertId;
      const team = await teamModel.create(`Team ${name}`, project_id)
        await teamModel.addUserToTeam(owner_id, team.insertId, "OWNER")
    return project
}

// Fonction pour mettre à jour un projet
const updateProject = async (id_project, {name,description}) => {
const result = await projectModel.update(name,description,id_project);
return result;
}

// Fonction pour supprimer un projet
const deleteProject = async (id_project) => {
    const result = await projectModel.remove(id_project)
    return result
}

// Fonction pour récupérer les projets d'un utilisateur
const getMyProjects = async (user_id) =>{
const result = await projectModel.findByUserId(user_id)
return result
}

export default {
    getAll,
    getById,
    getMyProjects,
    createProject,
    updateProject,
    deleteProject
}