import bugsService from '../services/bugs.service.js';

// Fonction pour récupérer les bugs d'un projet
const getBugByProject = async (req, res) => {
  const { project_id } = req.params;
  const result = await bugsService.getProjectBug(project_id);
  return res.status(200).json({ message: 'Liste des bugs du projet chargé', result });
};

// Fonction pour créer un bug
const createBug = async (req, res) => {
  const { project_id } = req.params;
  const { created_by } = req.user.id;
  const { title, description, status, file_url } = req.body;
  const result = await bugsService.createBug(
    title,
    description,
    status,
    file_url,
    project_id,
    created_by,
  );
  return res.status(200).json({ message: 'Bug créée avec succès !', result });
};

// Fonction pour mettre à jour un bug
const updateBug = async (req, res) => {
  const { id_bug } = req.params;
  const { title, description, status, file_url } = req.body;
  const result = await bugsService.updateBug(id_bug, title, description, status, file_url);
  return res.json({ message: 'Bug mise à jour avec succès !', result });
};

// Fonction pour supprimer un bug
const deleteBug = async (req, res) => {
  const { id_bug } = req.params;
  const result = await bugsService.deleteBug(id_bug);
  return res.status(200).json({ message: 'Bug supprimé avec succès !', result });
};
export default {
  getBugByProject,
  createBug,
  updateBug,
  deleteBug,
};
