import adminService from '../services/admin.service.js';
import sessionModel from '../models/userSession.model.js';
import auditModel from '../models/adminAudit.model.js';
import AppError from '../middleware/AppError.js';

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

// Liste des sessions, pour le panel.
// Les sessions récemment révoquées ou expirées restent dans la liste : c'est ce
// qui permet de constater qu'une révocation a bien eu lieu.
const getSessions = async (req, res) => {
  const sessions = await sessionModel.lister();

  // C'est le serveur qui désigne la session de celui qui regarde, plutôt que de
  // renvoyer son identifiant au navigateur pour l'y faire comparer : rien
  // n'oblige à sortir cet identifiant du cookie httpOnly, et moins il circule,
  // mieux c'est.
  // Le caractère actif est calculé ici et non dans le navigateur : c'est
  // l'horloge du serveur qui fait foi, et c'est elle qui décide déjà si la
  // session laisse passer une requête. Une machine dont l'heure est décalée
  // afficherait sinon des sessions actives comme expirées, ou l'inverse.
  const maintenant = Date.now();

  const result = sessions.map((session) => ({
    ...session,
    est_la_votre: session.id_session === req.user.sid,
    active: !session.revoked_at && new Date(session.expires_at).getTime() > maintenant,
  }));

  return res.status(200).json({ result });
};

// Fermeture d'une session précise
const revoquerSession = async (req, res) => {
  const { id_session } = req.params;

  // Se couper soi-même reviendrait à se déconnecter sans le vouloir en cliquant
  // dans une liste : le panel propose le bouton de déconnexion pour cela.
  if (id_session === req.user.sid) {
    throw new AppError('Utilisez la déconnexion pour fermer votre propre session', 400);
  }

  const result = await sessionModel.revoquer(id_session, req.user.id);

  if (result.affectedRows === 0) {
    throw new AppError('Session introuvable ou déjà fermée', 404);
  }

  req.auditDetails = 'Fermeture immédiate, avant expiration du jeton';

  return res.status(200).json({ message: 'Session fermée' });
};

// Fermeture de toutes les sessions d'un utilisateur, la sienne exceptée si
// l'administrateur agit sur son propre compte.
const revoquerSessionsUtilisateur = async (req, res) => {
  const { id_user } = req.params;
  const sauf = Number(id_user) === req.user.id ? req.user.sid : null;

  const result = await sessionModel.revoquerTout(id_user, req.user.id, sauf);

  req.auditDetails = `${result.affectedRows} session(s) fermée(s) sur ce compte`;

  return res.status(200).json({
    message: `${result.affectedRows} session(s) fermée(s)`,
    fermees: result.affectedRows,
  });
};

// Lecture du journal d'audit
const getAudit = async (req, res) => {
  const result = await auditModel.lister();
  return res.status(200).json({ result });
};

export default {
  getAudit,
  getDashboard,
  getUsers,
  getProjects,
  getSchemas,
  getJournals,
  getSessions,
  revoquerSession,
  revoquerSessionsUtilisateur,
};
