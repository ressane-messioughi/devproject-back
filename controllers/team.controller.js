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
// Fonction pour modifier le team_role d'un membre (req.team fourni par le middleware isProjectOwner)
const updateTeamRole = async (req, res) => {
  const { users_id } = req.params;
  const { team_role } = req.body;
  const result = await teamService.updateTeamRole(req.team, users_id, team_role);
  return res.status(200).json({
    message: "Rôle mis à jour avec succès",
    result,
  });
};
// Fonction pour retirer un membre de l'équipe (req.team fourni par le middleware isProjectOwner)
const removeMember = async (req, res) => {
  const { users_id, id_project } = req.params;
  const result = await teamService.removeMember(req.team, users_id);
  socketService.memberRemoved(users_id, id_project);
  return res.status(200).json({
    message: "Membre supprimé avec succès",
    result,
  });
};
export default {
  getUserTeam,
  deleteTeamUser,
  updateTeamRole,
  removeMember,
};
