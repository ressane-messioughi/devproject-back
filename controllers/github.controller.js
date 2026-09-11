import githubService from '../services/github.service.js';
import socketService from '../services/socket.service.js';
import AppError from '../middleware/AppError.js';

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
  socketService.githubUpdated(id_project);
  return res.status(201).json({ message: 'Répertoire créé avec succès !', result });
};

// Fonction pour mettre à jour un répertoire
const updateRepository = async (req, res) => {
  const { id_project, id_repository } = req.params;
  const { name, url, branch } = req.body;
  const result = await githubService.updateRepository(id_repository, name, url, branch);
  socketService.githubUpdated(id_project);
  return res.status(200).json({ message: 'Répertoire modifié avec succès !', result });
};

// Fonction pour supprimer un répertoire
const deleteRepository = async (req, res) => {
  const { id_project, id_repository } = req.params;
  const result = await githubService.deleteRepository(id_repository);
  socketService.githubUpdated(id_project);
  return res.status(200).json({ message: 'Répertoire supprimé avec succès !', result });
};

// Fonction pour retrouver un dépôt parmi ceux du projet.
// Passer par la liste du projet est le contrôle d'accès : on ne peut interroger que les
// dépôts rattachés au projet demandé, pas un identifiant pris au hasard.
const trouverDepot = async (id_project, id_repository) => {
  const repositories = await githubService.getProjectRepositories(id_project);
  const repository = repositories.find(
    (item) => Number(item.id_repository) === Number(id_repository),
  );

  if (!repository) {
    throw new AppError('Dépôt introuvable pour ce projet', 404);
  }
  return repository;
};

// Fonction pour récupérer les derniers commits d'un dépôt du projet
const getRepositoryCommits = async (req, res) => {
  const { id_project, id_repository } = req.params;
  const repository = await trouverDepot(id_project, id_repository);

  const result = await githubService.getRepositoryCommits(repository.url, repository.branch);
  return res.status(200).json({ message: 'Commits du dépôt chargés', result });
};

// Fonction pour lister les fichiers d'un dépôt, pour le choix du fichier fautif
const getRepositoryTree = async (req, res) => {
  const { id_project, id_repository } = req.params;
  const repository = await trouverDepot(id_project, id_repository);

  const result = await githubService.getRepositoryTree(repository.url, repository.branch);
  return res.status(200).json({ message: 'Fichiers du dépôt chargés', result });
};

// Fonction pour savoir si le dépôt est accessible avec les autorisations dont on dispose
const getRepositoryAccess = async (req, res) => {
  const { id_project, id_repository } = req.params;
  const repository = await trouverDepot(id_project, id_repository);

  const result = await githubService.getRepositoryAccess(repository.url);
  return res.status(200).json({ message: 'Accès au dépôt vérifié', result });
};

// Fonction pour télécharger l'archive du dépôt.
// Le flux vient de GitHub et repart tel quel vers le navigateur : le fichier ne touche
// jamais le disque du serveur, et le jeton ne sort jamais du backend.
const getRepositoryArchive = async (req, res) => {
  const { id_project, id_repository } = req.params;
  const repository = await trouverDepot(id_project, id_repository);

  const { flux, nom } = await githubService.getRepositoryArchive(
    repository.url,
    repository.branch,
  );

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${nom}"`);

  const { Readable } = await import('node:stream');
  return Readable.fromWeb(flux).pipe(res);
};

export default {
  getProjectRepositories,
  createRepository,
  updateRepository,
  deleteRepository,
  getRepositoryCommits,
  getRepositoryTree,
  getRepositoryAccess,
  getRepositoryArchive,
};
