import bugsService from '../services/bugs.service.js';
import socketService from '../services/socket.service.js';
import teamModel from '../models/team.model.js';
import cloudinary from '../config/cloudinary.js';

// Fonction pour récupérer les bugs d'un projet
const getBugByProject = async (req, res) => {
  const { id_project: project_id } = req.params;
  const result = await bugsService.getProjectBug(project_id);
  return res.status(200).json({ message: 'Liste des bugs du projet chargé', result });
};

// Fonction pour créer un bug (avec une capture d'écran obligatoire, uploadée sur Cloudinary)
const createBug = async (req, res) => {
  const { id_project: project_id } = req.params;
  const created_by = req.user.id;
  const { title, description, status } = req.body;

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'devproject/bugs' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(req.file.buffer);
  });
  const file_url = uploadResult.secure_url;

  const result = await bugsService.createBug(
    title,
    description,
    status,
    file_url,
    project_id,
    created_by,
  );

  // Récupération du team_role de l'auteur pour l'affichage du badge en temps réel
  const team = await teamModel.findByProjectId(project_id);
  const teamUser = team ? await teamModel.getUserRole(created_by, team.id_team) : null;

  const newBug = {
    id_bug: result.insertId,
    title,
    description,
    status,
    file_url,
    project_id,
    created_by,
    created_at: new Date(),
    username: req.user.username,
    avatar: req.user.avatar,
    team_role: teamUser?.team_role || null,
  };
  socketService.newBug(project_id, newBug);
  socketService.bugNotifyTeam(project_id, req.user, title);

  return res.status(200).json({ message: 'Bug créée avec succès !', result });
};

// Fonction pour modifier le titre et la description d'un bug (uniquement l'auteur)
const updateBug = async (req, res) => {
  const { id_project: project_id, id_bug } = req.params;
  const { title, description } = req.body;
  const requester_id = req.user.id;
  const result = await bugsService.updateBug(id_bug, requester_id, title, description);

  socketService.bugUpdated(project_id, { id_bug: Number(id_bug), title, description });

  return res.json({ message: 'Bug mise à jour avec succès !', result });
};

// Fonction pour changer le statut d'un bug (n'importe quel membre de l'équipe)
const updateBugStatus = async (req, res) => {
  const { id_project: project_id, id_bug } = req.params;
  const { status } = req.body;
  const updated_by = req.user.id;
  const result = await bugsService.updateBugStatus(id_bug, status, updated_by);

  const updatedBug = {
    id_bug: Number(id_bug),
    status,
    updated_by_username: req.user.username,
    updated_by_avatar: req.user.avatar,
  };
  socketService.bugStatusUpdated(project_id, updatedBug);

  return res.status(200).json({ message: 'Statut du bug mis à jour avec succès !', result });
};

// Fonction pour supprimer un bug (uniquement le owner du projet, voir middleware isProjectOwner)
const deleteBug = async (req, res) => {
  const { id_project: project_id, id_bug } = req.params;
  const result = await bugsService.deleteBug(id_bug);

  socketService.bugDeleted(project_id, Number(id_bug));

  return res.status(200).json({ message: 'Bug supprimé avec succès !', result });
};
export default {
  getBugByProject,
  createBug,
  updateBug,
  updateBugStatus,
  deleteBug,
};
