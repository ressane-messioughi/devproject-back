import joinRequestModel from "../models/joinRequest.model.js"
import teamModel from "../models/team.model.js";
import projectModel from "../models/project.model.js";
import AppError from "../middleware/AppError.js";

// Fonction pour créer une demande de rejoindre une équipe
const createRequest = async (team_code, user_id) => {
    const project = await joinRequestModel.findProjectByTeamCode(team_code);

    // On ne peut pas demander à rejoindre un projet dont on est déjà membre
    const team = await teamModel.findByProjectId(project.id_project);
    const membership = team ? await teamModel.getUserRole(user_id, team.id_team) : null;
    if (membership) {
      throw new AppError("Tu es déjà membre de ce projet ❌", 401);
    }

    // Ni en envoyer une deuxième tant qu'une demande est déjà en attente
    const pendingRequest = await joinRequestModel.findPendingByUserAndProject(project.id_project, user_id);
    if (pendingRequest) {
      throw new AppError("Une demande est déjà en attente pour ce projet ❌", 401);
    }

    const result = await joinRequestModel.create(project.id_project, user_id)
    return {result, project}
};
// Fonction pour récupérer toutes les demandes d'un projet
const getAllRequestByProject = async (id_project) => {
    const result = await joinRequestModel.findAllProjectById(id_project);
    return result
};
// Fonction pour accepter une demande de rejoindre un projet
const acceptRequest = async (id_request) => {
  const request = await joinRequestModel.findById(id_request);
  const team = await teamModel.findByProjectId(request.project_id);
  await teamModel.addUserToTeam(request.user_id, team.id_team, 'MEMBER');
  await joinRequestModel.updateStatus(id_request, 'ACCEPTED');

  // Récupération des infos du projet pour notifier l'utilisateur accepté (rejoint via WebSocket)
  const [project] = await projectModel.findById(request.project_id);

  return { ...request, project };
};
// Fonction pour refuser une demande de rejoindre un projet
const refuseRequest = async (id_request) => {
    const request = await joinRequestModel.updateStatus(id_request, "REFUSED") 
    return request
}

export default {
    createRequest,
    getAllRequestByProject,
    acceptRequest,
    refuseRequest
}