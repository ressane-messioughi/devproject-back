import crypto from 'crypto';
import bcrypt from 'bcrypt';

import authModel from '../models/auth.model.js';
import tokenModel from '../models/userToken.model.js';
import sessionModel from '../models/userSession.model.js';
import AppError from '../middleware/AppError.js';
import { envoyerEmail } from './email.service.js';
import {
  messageConfirmation,
  messageReinitialisation,
  messageBienvenue,
  DUREE_CONFIRMATION_HEURES,
  DUREE_REINITIALISATION_MINUTES,
} from '../utils/emailMessages.js';

// Confirmation d'adresse, mot de passe oublié et message de bienvenue.
//
// Ces trois parcours partagent la même mécanique de jeton, réunie ici plutôt
// que dispersée dans le service d'authentification, déjà chargé.

const TYPE_CONFIRMATION = 'EMAIL_CONFIRMATION';
const TYPE_REINITIALISATION = 'PASSWORD_RESET';

const APP_URL = () => process.env.APP_URL || 'https://devproject.ressane.fr';

/**
 * Fabrique un jeton, en range l'empreinte, et rend la valeur en clair.
 *
 * La valeur en clair n'existe qu'ici et dans l'email : la base ne contient que
 * son empreinte SHA-256. Une fuite de la table ne permet donc de prendre la main
 * sur aucun compte, là où des jetons stockés en clair seraient autant de portes
 * ouvertes.
 *
 * 32 octets tirés par le générateur cryptographique du système : c'est bien
 * au-delà de ce qu'une attaque par essais successifs peut parcourir, et
 * Math.random ne conviendrait pas, ses valeurs étant prédictibles.
 */
const creerJeton = async (users_id, type, dureeMinutes) => {
  await tokenModel.invaliderPrecedents(users_id, type);

  const jetonClair = crypto.randomBytes(32).toString('base64url');
  const empreinte = crypto.createHash('sha256').update(jetonClair).digest('hex');

  const expiration = new Date(Date.now() + dureeMinutes * 60 * 1000);
  await tokenModel.create(users_id, type, empreinte, expiration);

  return jetonClair;
};

/** Retrouve le jeton correspondant, ou undefined s'il est faux, périmé ou déjà utilisé. */
const lireJeton = async (jetonClair, type) => {
  if (!jetonClair || typeof jetonClair !== 'string') return undefined;
  const empreinte = crypto.createHash('sha256').update(jetonClair).digest('hex');
  return tokenModel.findValide(empreinte, type);
};

// ---------------------------------------------------------------------------
//  Confirmation de l'adresse
// ---------------------------------------------------------------------------

/**
 * Envoie le lien de confirmation. Appelé à l'inscription, et à la demande.
 *
 * Ne lève pas si l'email ne part pas : le compte est créé, et l'utilisateur
 * pourra redemander un lien. Faire échouer l'inscription pour un serveur SMTP
 * momentanément injoignable serait pire.
 */
const envoyerLienConfirmation = async ({ id, firstname, email }) => {
  const jeton = await creerJeton(id, TYPE_CONFIRMATION, DUREE_CONFIRMATION_HEURES * 60);
  const url = `${APP_URL()}/confirmation?jeton=${encodeURIComponent(jeton)}`;

  const { sujet, html } = messageConfirmation({ prenom: firstname, url });
  return envoyerEmail({ destinataire: email, sujet, html });
};

/**
 * Confirme une adresse à partir du jeton reçu par email, puis envoie la
 * bienvenue si elle n'est jamais partie.
 */
const confirmerAdresse = async (jetonClair) => {
  const jeton = await lireJeton(jetonClair, TYPE_CONFIRMATION);

  if (!jeton) {
    throw new AppError('Ce lien de confirmation est invalide ou a expiré', 400);
  }

  await authModel.confirmerEmail(jeton.users_id);
  await tokenModel.marquerUtilise(jeton.id_token);

  // La mise à jour ne touche la ligne que si welcome_sent_at était NULL. Le
  // nombre de lignes modifiées dit donc si c'est bien la première fois, sans
  // qu'une confirmation rejouée puisse déclencher un second message.
  const marquage = await authModel.marquerBienvenueEnvoyee(jeton.users_id);

  if (marquage.affectedRows === 1) {
    const { sujet, html } = messageBienvenue({ prenom: jeton.firstname });
    await envoyerEmail({ destinataire: jeton.email, sujet, html });
  }

  return { email: jeton.email, prenom: jeton.firstname };
};

/** Renvoie un lien de confirmation à une adresse qui n'est pas encore confirmée. */
const renvoyerLienConfirmation = async (email) => {
  const trouves = await authModel.findByEmail(email);
  const utilisateur = trouves[0];

  // Réponse volontairement identique que l'adresse existe ou non : répondre
  // différemment permettrait de savoir qui est inscrit sur le site.
  if (!utilisateur || utilisateur.email_verified_at) return;

  await envoyerLienConfirmation(utilisateur);
};

// ---------------------------------------------------------------------------
//  Mot de passe oublié
// ---------------------------------------------------------------------------

/**
 * Envoie un lien de réinitialisation.
 *
 * Ne dit jamais si l'adresse est connue. Sans cette précaution, le formulaire
 * de mot de passe oublié devient un moyen de vérifier qui possède un compte, une
 * adresse après l'autre.
 */
const demanderReinitialisation = async (email) => {
  const trouves = await authModel.findByEmail(email);
  const utilisateur = trouves[0];

  if (!utilisateur) return;

  const jeton = await creerJeton(
    utilisateur.id,
    TYPE_REINITIALISATION,
    DUREE_REINITIALISATION_MINUTES,
  );
  const url = `${APP_URL()}/reinitialisation?jeton=${encodeURIComponent(jeton)}`;

  const { sujet, html } = messageReinitialisation({ prenom: utilisateur.firstname, url });
  await envoyerEmail({ destinataire: utilisateur.email, sujet, html });
};

/**
 * Remplace le mot de passe à partir d'un jeton valide.
 *
 * Le jeton est consommé avant l'écriture du nouveau mot de passe : si deux
 * requêtes arrivent avec le même lien, la seconde ne trouve plus de jeton
 * valable.
 */
const reinitialiserMotDePasse = async (jetonClair, nouveauMotDePasse) => {
  const jeton = await lireJeton(jetonClair, TYPE_REINITIALISATION);

  if (!jeton) {
    throw new AppError('Ce lien de réinitialisation est invalide ou a expiré', 400);
  }

  await tokenModel.marquerUtilise(jeton.id_token);

  const hash = await bcrypt.hash(nouveauMotDePasse, 10);
  await authModel.updatePassword(jeton.users_id, hash);

  // Toutes les sessions ouvertes de ce compte sont fermées.
  //
  // Changer son mot de passe après une intrusion ne servirait à rien si la
  // personne qui avait pris la main y restait connectée : son jeton est déjà
  // émis, et le nouveau mot de passe ne l'invalide pas.
  await sessionModel.revoquerTout(jeton.users_id);

  return { users_id: jeton.users_id, email: jeton.email };
};

export default {
  envoyerLienConfirmation,
  confirmerAdresse,
  renvoyerLienConfirmation,
  demanderReinitialisation,
  reinitialiserMotDePasse,
};
