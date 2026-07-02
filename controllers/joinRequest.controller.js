import joinRequestService from '../services/joinRequest.service.js';

// Fonction pour créer une demande de rejoindre un projet
const createRequest = async (req, res) => {
  const { team_code } = req.body;
  const user_id = req.user.id;
  const {result, project} = await joinRequestService.createRequest(team_code, user_id);
  const io = req.app.get('io');

  io.to(`project_${project.id_project}`).emit('newJoinRequest', {
    id_request: result.insertId,
    project_id: project.id_project,
    status: 'PENDING',
    firstname: req.user.firstname,
    lastname: req.user.lastname,
    username: req.user.username,
    avatar: req.user.avatar,
  });
  
  return res.status(201).json({ message: 'Demande envoyée avec succès ! ✅', result });
};

// Fonction pour récupérer toutes les demandes d'un projet
const getAllRequestByProject = async (req, res) => {
  const { id_project } = req.params;
  const result = await joinRequestService.getAllRequestByProject(id_project);
  return res.status(200).json(result);
};

// Fonction pour accepter une demande de rejoindre un projet
const acceptRequest = async (req, res) => {
  const { id_request } = req.params;
  const result = await joinRequestService.acceptRequest(id_request);
  const io = req.app.get('io');

  io.to(`project_${result.project_id}`).emit('memberJoinedProject', {
    project_id: result.project_id,
    username: result.username,
    avatar: result.avatar,
  });
  console.log('code', result);

  return res.status(201).json({ message: 'Demande accepté avec succès ! ✅', result });
};

// Fonction pour refuser une demande de rejoindre un projet
const refuseRequest = async (req, res) => {
  const { id_request } = req.params;
  const result = await joinRequestService.refuseRequest(id_request);
  return res.status(200).json({ message: 'Demannde refusé avec succès ! ⛔️', result });
};

export default {
  createRequest,
  getAllRequestByProject,
  acceptRequest,
  refuseRequest,
};
