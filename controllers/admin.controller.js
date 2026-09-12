import adminService from '../services/admin.service.js';
import sessionModel from '../models/userSession.model.js';
import auditModel from '../models/adminAudit.model.js';
import cloudinary from '../config/cloudinary.js';
import campaignModel, { PUBLICS_VALIDES } from '../models/emailCampaign.model.js';
import { sanitizeHtml } from '../utils/sanitizeHtml.js';
import { messageCampagne } from '../utils/emailMessages.js';
import { envoyerParLots, smtpEstConfigure } from '../services/email.service.js';
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

// Envoi d'une image destinée au corps d'une campagne.
//
// Le Journal a sa propre route, mais elle est rattachée à un projet : elle ne
// convient pas ici. Le traitement est le même, dossier et bornes compris, pour
// que les deux éditeurs produisent des adresses de la même forme — c'est ce que
// le nettoyage anti-XSS attend.
const envoyerImageCampagne = async (req, res) => {
  if (!req.file) {
    throw new AppError('Aucune image reçue', 400);
  }

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'devproject/campagne' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(req.file.buffer);
  });

  const url = cloudinary.url(uploadResult.public_id, {
    secure: true,
    analytics: false,
    transformation: [{ width: 900, crop: 'limit', quality: 'auto' }],
    format: uploadResult.format,
  });

  return res.status(201).json({ message: 'Image envoyée', url });
};

// Campagnes passées, et état de l'envoi.
//
// L'état du SMTP est renvoyé avec : sans lui, le panel proposerait d'écrire un
// message qui ne partirait nulle part, et rien ne l'expliquerait à l'écran.
const getEmails = async (req, res) => {
  const [campagnes, compteurs] = await Promise.all([
    campaignModel.lister(),
    Promise.all(
      PUBLICS_VALIDES.map(async (cle) => [cle, await campaignModel.compterDestinataires(cle)]),
    ),
  ]);

  return res.status(200).json({
    result: campagnes,
    publics: Object.fromEntries(compteurs),
    smtp: smtpEstConfigure(),
  });
};

// Envoi d'une campagne.
const envoyerCampagne = async (req, res) => {
  const { sujet, contenu, destinataires } = req.body;

  if (!PUBLICS_VALIDES.includes(destinataires)) {
    throw new AppError('Public de destinataires inconnu', 400);
  }

  // Le contenu vient de l'éditeur enrichi et repasse par le nettoyage, même si
  // le navigateur l'a déjà fait : un appel direct à l'API contourne entièrement
  // le formulaire, et le serveur est le seul endroit où la règle ne peut pas
  // être évitée.
  const contenuPropre = sanitizeHtml(contenu);

  // Un message vide n'est pas une chaîne vide.
  //
  // L'éditeur rend toujours au moins un paragraphe : « <p></p> » passait donc
  // le test, et une campagne sans le moindre mot partait vers tous les inscrits.
  // Ce qui compte est le texte, ou à défaut une image, pas le balisage.
  const texte = contenuPropre
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
  const contientUneImage = /<img\b/i.test(contenuPropre);

  if (!texte && !contientUneImage) {
    throw new AppError('Le message est vide', 400);
  }

  const adresses = await campaignModel.listerDestinataires(destinataires);

  if (adresses.length === 0) {
    throw new AppError('Aucun destinataire pour ce public', 400);
  }

  const { sujet: objet, html } = messageCampagne({ sujet, contenuHtml: contenuPropre });
  const { envoyes, echecs } = await envoyerParLots({ destinataires: adresses, sujet: objet, html });

  await campaignModel.create({
    admin_id: req.user.id,
    sujet,
    contenu: contenuPropre,
    destinataires,
    nb_envoyes: envoyes,
    nb_echecs: echecs.length,
  });

  // Repris par le journal d'audit, qui écrit la trace en fin de réponse.
  req.auditDetails = `« ${sujet} » vers ${destinataires} : ${envoyes} envoyé(s), ${echecs.length} échec(s)`;

  return res.status(201).json({
    message: `${envoyes} message(s) envoyé(s)`,
    envoyes,
    echecs: echecs.length,
  });
};

// Lecture du journal d'audit
const getAudit = async (req, res) => {
  const result = await auditModel.lister();
  return res.status(200).json({ result });
};

export default {
  getAudit,
  getEmails,
  envoyerCampagne,
  envoyerImageCampagne,
  getDashboard,
  getUsers,
  getProjects,
  getSchemas,
  getJournals,
  getSessions,
  revoquerSession,
  revoquerSessionsUtilisateur,
};
