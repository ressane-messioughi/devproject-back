import projectModel from '../models/project.model.js'
import teamModel from '../models/team.model.js';


const generateTeamCode = () => {
  return "TEAM-" + Math.random().toString(36).substring(2, 8).toUpperCase();
};

const getAll = async () => {
 const result = await projectModel.findAll();
 return result 
}
const getById = async (id) => {
    const result = await projectModel.findById(id)
    return result 
}
const createProject = async (name,description,owner_id) => {
    const team_code = generateTeamCode();
    const project = await projectModel.create(name,description,owner_id, team_code)
      const project_id = project.insertId;
      const team = await teamModel.create(`Team ${name}`, project_id)
        await teamModel.addUserToTeam(owner_id, team.insertId, "OWNER")
    return project
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