import githubService from '../services/github.service.js';

// Fonction pour récupérer les répertoires d'un projet
const getProjectRepositories = async (req, res) => {
  const { id_project } = req.params;
  const result = await githubService.getProjectRepositories(id_project);
  return res.status(200).json({ message: 'Répertoire du projet récupéré avec succès !', result });
};

//Fonction pour créer un répertoire
const createRepository = async (req, res) => {
  const { id_project } = req.params;
  const { name, url, branch } = req.body;
  const result = await githubService.createRepository(name, url, branch, id_project);
  return res.status(201).json({ message: 'Répertoire créée aevc succès !', result });
};

// Fonction pour mettre à jour un répertoire
const updateRepository = async (req, res) => {
  const { id_repository } = req.params;
  const { name, url, branch } = req.body;
  const result = await githubService.updateRepository(id_repository, name, url, branch);
  return res.status(200).json({ message: 'Répertoire modifié avec succès !', result });
};

// Fonction pour supprimer un répertoire
const deleteRepository = async (req, res) => {
  const { id_repository } = req.params;
  const result = await githubService.deleteRepository(id_repository);
  return res.status(200).json({ message: 'Répertoire supprimé avec succès !', result });
};

export default {
  getProjectRepositories,
  createRepository,
  updateRepository,
  deleteRepository,
};
