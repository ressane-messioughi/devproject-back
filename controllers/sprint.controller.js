import sprintService from '../services/sprint.service.js';

// Fonction pour récupérer les sprints d'un projet
const getProjectSprint = async (req, res) => {
  const { id_project } = req.params;
  const result = await sprintService.getProjectSprints(id_project);
  return res.status(200).json(result);
};
// Fonction pour créer un sprint
const createSprint = async (req, res) => {
  const { id_project } = req.params;
  const { name, start_date, end_date, status } = req.body;
  const result = await sprintService.createSprint(name, start_date, end_date, status, id_project);
  return res.status(201).json({ message: 'Sprint créée avec succès !', result });
};
// Fonction pour mettre à jour un sprint
const updateSprint = async (req, res) => {
  const { id_sprint } = req.params;
  const { name, start_date, end_date, status } = req.body;
  const result = await sprintService.updateSprint(id_sprint, name, start_date, end_date, status);
  return res.status(200).json({ message: 'Sprint modifié avec succès !', result });
};
// Fonction pour supprimer un sprint
const deleteSprint = async (req, res) => {
  const { id_sprint } = req.params;
  const result = await sprintService.deleteSprint(id_sprint);
  return res.status(200).json({ message: 'Sprint supprimé avec succès !', result });
};
export default {
  getProjectSprint,
  createSprint,
  updateSprint,
  deleteSprint,
};
