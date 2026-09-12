import dailyModel from '../models/daily.model.js';
import AppError from '../middleware/AppError.js';

// Fonction pour récupérer le daily courant d'un projet
const getCurrent = async (project_id) => dailyModel.findCurrentByProject(project_id);

// Fonction pour planifier un daily.
// Un seul à la fois : planifier alors qu'un autre est déjà prévu ou en cours créerait
// deux cloches concurrentes chez les membres.
const planifier = async (donnees, project_id, created_by) => {
  const existant = await dailyModel.findCurrentByProject(project_id);
  if (existant) {
    throw new AppError('Un daily est déjà prévu pour ce projet', 409);
  }
  return dailyModel.create(donnees, project_id, created_by);
};

// Fonction pour modifier un daily.
// Une fois lancé, seules la clôture et l'annulation restent possibles : en déplacer
// l'horaire pendant qu'il se déroule n'aurait pas de sens.
const modifier = async (id_daily, donnees) => {
  const daily = await dailyModel.findById(id_daily);
  if (!daily) {
    throw new AppError('Daily introuvable', 404);
  }
  if (daily.status === 'EN COURS') {
    throw new AppError("Le daily est en cours, il ne peut plus être modifié", 409);
  }
  return dailyModel.update(id_daily, donnees);
};

// Fonction pour lancer le daily
const lancer = async (id_daily) => {
  const daily = await dailyModel.findById(id_daily);
  if (!daily) {
    throw new AppError('Daily introuvable', 404);
  }
  if (daily.status === 'EN COURS') {
    throw new AppError('Le daily est déjà en cours', 409);
  }
  await dailyModel.start(id_daily);
  return dailyModel.findById(id_daily);
};

// Fonction pour clore le daily
const clore = async (id_daily) => {
  const daily = await dailyModel.findById(id_daily);
  if (!daily) {
    throw new AppError('Daily introuvable', 404);
  }
  return dailyModel.end(id_daily);
};

// Fonction pour annuler un daily
const annuler = async (id_daily) => {
  const daily = await dailyModel.findById(id_daily);
  if (!daily) {
    throw new AppError('Daily introuvable', 404);
  }
  return dailyModel.remove(id_daily);
};

export default { getCurrent, planifier, modifier, lancer, clore, annuler };
