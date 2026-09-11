import adminModel from '../models/admin.model.js';

// Fonction pour rassembler le tableau de bord de l'administration en un seul appel.
// Les huit requêtes partent en parallèle : elles ne dépendent pas les unes des autres,
// les enchaîner ferait attendre pour rien.
const getTableauDeBord = async () => {
  const [kpi, inscriptions, projetsParMois, roles] = await Promise.all([
    adminModel.getKpi(),
    adminModel.getInscriptionsParMois(),
    adminModel.getProjetsParMois(),
    adminModel.getRepartitionRoles(),
  ]);

  return { kpi, inscriptions, projetsParMois, roles };
};

const getUsers = async () => adminModel.findAllUsers();
const getProjects = async () => adminModel.findAllProjects();
const getSchemas = async () => adminModel.findAllSchemas();
const getJournals = async () => adminModel.findAllJournals();

export default {
  getTableauDeBord,
  getUsers,
  getProjects,
  getSchemas,
  getJournals,
};
