import dailyService from '../services/daily.service.js';
import socketService from '../services/socket.service.js';
import teamModel from '../models/team.model.js';

// Fonction pour indiquer si la personne peut gérer le point quotidien.
// Le navigateur en a besoin pour décider d'afficher ou non les commandes ; le contrôle
// réel reste fait par le middleware sur chaque route qui modifie quelque chose.
const peutGerer = async (users_id, id_project) => {
  const team = await teamModel.findByProjectId(id_project);
  if (!team) return false;

  const userRole = await teamModel.getUserRole(users_id, team.id_team);
  return userRole?.role === 'OWNER' || userRole?.team_role === 'Scrum';
};

// Fonction pour récupérer le point quotidien courant du projet
const getCurrent = async (req, res) => {
  const { id_project } = req.params;
  const result = await dailyService.getCurrent(id_project);
  const gestion = await peutGerer(req.user.id, id_project);

  return res.status(200).json({ message: 'Point quotidien du projet', result, gestion });
};

// Fonction pour planifier un point quotidien
const create = async (req, res) => {
  const { id_project } = req.params;
  const result = await dailyService.planifier(req.body, id_project, req.user.id);
  const daily = await dailyService.getCurrent(id_project);

  socketService.dailyUpdated(id_project, daily);
  socketService.dailyNotifyTeam(id_project, req.user, 'planifie');

  return res.status(201).json({ message: 'Point quotidien planifié !', result });
};

// Fonction pour modifier un point quotidien
const update = async (req, res) => {
  const { id_project, id_daily } = req.params;
  const result = await dailyService.modifier(id_daily, req.body);
  const daily = await dailyService.getCurrent(id_project);

  socketService.dailyUpdated(id_project, daily);

  return res.status(200).json({ message: 'Point quotidien modifié', result });
};

// Fonction pour lancer le point quotidien.
// L'heure de départ vient du serveur : le minuteur affiché chez chaque membre doit
// partir du même instant, quelle que soit l'heure de sa machine.
const start = async (req, res) => {
  const { id_project, id_daily } = req.params;
  await dailyService.lancer(id_daily);
  const daily = await dailyService.getCurrent(id_project);

  socketService.dailyUpdated(id_project, daily);
  socketService.dailyNotifyTeam(id_project, req.user, 'lance');

  return res.status(200).json({ message: 'Point quotidien lancé !', result: daily });
};

// Fonction pour clore le point quotidien
const end = async (req, res) => {
  const { id_project, id_daily } = req.params;
  const result = await dailyService.clore(id_daily);

  socketService.dailyUpdated(id_project, null);

  return res.status(200).json({ message: 'Point quotidien terminé', result });
};

// Fonction pour annuler un point quotidien
const remove = async (req, res) => {
  const { id_project, id_daily } = req.params;
  const result = await dailyService.annuler(id_daily);

  socketService.dailyUpdated(id_project, null);

  return res.status(200).json({ message: 'Point quotidien annulé', result });
};

export default { getCurrent, create, update, start, end, remove };
