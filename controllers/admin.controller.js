import adminService from '../services/admin.service.js';

// Fonction pour récupérer le tableau de bord de l'administration
const getDashboard = async (req, res) => {
  const result = await adminService.getTableauDeBord();
  return res.status(200).json({ message: "Tableau de bord de l'administration", result });
};

// Fonction pour récupérer tous les comptes du site
const getUsers = async (req, res) => {
  const result = await adminService.getUsers();
  return res.status(200).json({ message: 'Comptes chargés', result });
};

// Fonction pour récupérer tous les projets du site
const getProjects = async (req, res) => {
  const result = await adminService.getProjects();
  return res.status(200).json({ message: 'Projets chargés', result });
};

// Fonction pour récupérer tous les schémas du site
const getSchemas = async (req, res) => {
  const result = await adminService.getSchemas();
  return res.status(200).json({ message: 'Schémas chargés', result });
};

// Fonction pour récupérer tous les journaux du site
const getJournals = async (req, res) => {
  const result = await adminService.getJournals();
  return res.status(200).json({ message: 'Journaux chargés', result });
};

export default { getDashboard, getUsers, getProjects, getSchemas, getJournals };
