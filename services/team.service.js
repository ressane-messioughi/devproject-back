import teamModel from "../models/team.model.js";

// Fonction pour récupérer l'équipe d'un projet
const getUserTeam = async (project_id) => {
    const result = await teamModel.getUserTeam(project_id);
    return result
}

// Fonction pour supprimer un utilisateur d'une équipe  
const deleteTeamUser = async (users_id, team_id) => {
    const result = await teamModel.removeTeamUser(users_id, team_id);
    return result 
}
export default {
    getUserTeam,
    deleteTeamUser
}