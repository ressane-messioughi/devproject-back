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
// Fonction pour modifier le team_role d'un membre
// (l'autorisation "owner uniquement" est vérifiée en amont par le middleware isProjectOwner)
const updateTeamRole = async (team, users_id, team_role) => {
    const result = await teamModel.updateTeamRole(users_id, team.id_team, team_role);
    return result
}
// Fonction pour retirer un membre de l'équipe
// (l'autorisation "owner uniquement" est vérifiée en amont par le middleware isProjectOwner)
const removeMember = async (team, users_id) => {
    const result = await teamModel.removeTeamUser(users_id, team.id_team);
    return result
}
export default {
    getUserTeam,
    deleteTeamUser,
    updateTeamRole,
    removeMember
}