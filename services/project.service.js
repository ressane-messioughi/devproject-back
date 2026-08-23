import projectModel from '../models/project.model.js'
import teamModel from '../models/team.model.js';
import journalModel from '../models/journal.model.js';
import schemaModel from '../models/schema.model.js';
import sprintModel from '../models/sprint.model.js';
import taskModel from '../models/task.model.js';
import bugsModel from '../models/bugs.model.js';
import githubModel from '../models/github.model.js';
import joinRequestModel from '../models/joinRequest.model.js';

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
const createProject = async (name,description,owner_id,trello_url) => {
    const team_code = generateTeamCode();
    const project = await projectModel.create(name,description,owner_id, team_code, trello_url)
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

// Fonction pour supprimer un projet et toutes les données liées
// (l'autorisation "owner uniquement" est vérifiée en amont par le middleware isProjectOwner)
const deleteProject = async (id_project, team) => {
    await joinRequestModel.removeByProjectId(id_project);
    await journalModel.removeByProjectId(id_project);
    await schemaModel.removeByProjectId(id_project);
    await sprintModel.removeByProjectId(id_project);
    await taskModel.removeByProjectId(id_project);
    await bugsModel.removeByProjectId(id_project);
    await githubModel.removeByProjectId(id_project);

    if (team) {
        await teamModel.removeAllTeamUsers(team.id_team);
        await teamModel.removeTeam(team.id_team);
    }

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