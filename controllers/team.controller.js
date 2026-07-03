import teamService from '../services/team.service.js';
import socketService from '../services/socket.service.js';

// Fonction pour récupérer l'équipe d'un projet
const getUserTeam = async (req, res) => {
  const { id_project } = req.params;
  const result = await teamService.getUserTeam(id_project);
  return res.status(200).json(result);
};
// Fonction pour supprimer un utilisateur d'une équipe
const deleteTeamUser = async (req, res) => {
  const users_id = req.user.id;
  const { id_project, team_id } = req.params;
  const result = await teamService.deleteTeamUser(users_id, team_id);
  socketService.deleteProject(id_project, req.user);
  return res.status(200).json({
    message: "Utilisateur supprimé avec succès",
    result,
  });
};
export default {
  getUserTeam,
  deleteTeamUser,
};
