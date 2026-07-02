import teamService from '../services/team.service.js';

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

  const io = req.app.get("io");

  io.to(`project_${id_project}`).emit("memberLeftProject", {
    project_id: id_project,
    user_id: req.user.id,
    username: req.user.username,
    avatar: req.user.avatar,
  });

  return res.status(200).json({
    message: "Utilisateur supprimé avec succès",
    result,
  });
};
export default {
  getUserTeam,
  deleteTeamUser,
};
