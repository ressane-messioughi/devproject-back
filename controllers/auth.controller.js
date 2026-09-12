import authService from '../services/auth.service.js';
import accountService from '../services/account.service.js';
import sessionModel from '../models/userSession.model.js';
import cloudinary from '../config/cloudinary.js';
import jwt from 'jsonwebtoken';
import { COOKIE_NAME, cookieOptions, clearCookieOptions } from '../middleware/cookie.middleware.js';

// Fonction Connexion
// Le jeton n'est plus renvoyé dans le corps de la réponse : il est posé dans un cookie
// httpOnly, que le navigateur renverra tout seul à chaque requête et que le JavaScript
// de la page ne peut pas lire.
export const login = async (req, res) => {
  const { email, password } = req.body;

  // L'adresse et le navigateur sont rangés avec la session : sans eux, le panel
  // d'administration montrerait une liste de sessions indistinguables, et
  // choisir laquelle couper deviendrait impossible.
  const { token, user } = await authService.loginUser(
    { email, password },
    { ip: req.ip, userAgent: req.get('user-agent') },
  );

  res.cookie(COOKIE_NAME, token, cookieOptions());

  return res.status(200).json({ message: 'Connexion réussie', user });
};

// Fonction Déconnexion
// Le navigateur ne peut pas supprimer un cookie httpOnly : seul le serveur le peut.
export const logout = async (req, res) => {
  // La session est fermée en base avant d'effacer le cookie. Sans cela, se
  // déconnecter ne faisait qu'oublier le jeton côté navigateur : celui-ci
  // restait valable, et une copie conservée ailleurs fonctionnait encore.
  const token = req.cookies?.[COOKIE_NAME];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.sid) await sessionModel.revoquer(decoded.sid);
    } catch {
      // Jeton déjà expiré ou illisible : il n'y a plus de session à fermer, et
      // la déconnexion doit aboutir quand même.
    }
  }

  res.clearCookie(COOKIE_NAME, clearCookieOptions());
  return res.status(200).json({ message: 'Déconnexion réussie' });
};

// Fonction qui renvoie l'utilisateur de la session en cours.
// Elle remplace le décodage du jeton côté navigateur : celui-ci n'y a plus accès, c'est
// donc le serveur qui dit qui est connecté.
//
// Volontairement hors du middleware authenticate : une page publique l'appelle au
// chargement pour savoir s'il faut afficher la session. Répondre 401 à « qui suis-je ? »
// alors que la réponse est simplement « personne » remplirait la console du visiteur
// d'erreurs, sans qu'aucune faute n'ait été commise.
export const me = async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(200).json({ user: null });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // Jeton expiré ou trafiqué : on nettoie le cookie au passage
    res.clearCookie(COOKIE_NAME, clearCookieOptions());
    return res.status(200).json({ user: null });
  }

  // Cette route ne passe pas par authenticate, puisqu'elle doit pouvoir répondre
  // « personne » en 200 depuis une page publique. Le contrôle de session doit
  // donc être refait ici : sans lui, un jeton révoqué continuerait d'annoncer
  // l'utilisateur comme connecté, et l'application le laisserait entrer avant
  // de se heurter au premier 401.
  const session = decoded.sid ? await sessionModel.findActive(decoded.sid) : null;

  if (!session) {
    res.clearCookie(COOKIE_NAME, clearCookieOptions());
    return res.status(200).json({ user: null });
  }

  return res.status(200).json({ user: decoded });
};

// Fonction Inscription
export const register = async (req, res) => {
  const { firstname, lastname, username, email, password, avatar, city, phone, role } = req.body;
  const user = await authService.registerUser({
    firstname,
    lastname,
    username,
    email,
    password,
    avatar,
    city,
    phone,
    role,
  });
  // Le lien de confirmation part maintenant, mais son échec ne doit pas faire
  // échouer l'inscription : le compte existe, et l'utilisateur pourra redemander
  // un lien depuis l'écran de connexion.
  await accountService.envoyerLienConfirmation({
    id: user.insertId,
    firstname,
    email,
  });

  return res.status(201).json({
    message: 'Utilisateur créé avec succès',
    user: { id: user.insertId },
  });
};

// Fonction Confirmation de l'adresse email
export const confirmEmail = async (req, res) => {
  const { jeton } = req.body;
  const { prenom } = await accountService.confirmerAdresse(jeton);

  return res.status(200).json({ message: 'Adresse confirmée', prenom });
};

// Fonction Renvoi du lien de confirmation
// Répond toujours 200, que l'adresse existe ou non : une réponse différente
// permettrait de savoir qui est inscrit sur le site.
export const resendConfirmation = async (req, res) => {
  const { email } = req.body;
  await accountService.renvoyerLienConfirmation(email);

  return res.status(200).json({
    message: "Si un compte existe pour cette adresse et n'est pas encore confirmé, un lien vient d'être envoyé",
  });
};

// Fonction Demande de réinitialisation du mot de passe
// Même principe : la réponse ne dit jamais si l'adresse est connue.
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  await accountService.demanderReinitialisation(email);

  return res.status(200).json({
    message: "Si un compte existe pour cette adresse, un lien de réinitialisation vient d'être envoyé",
  });
};

// Fonction Choix d'un nouveau mot de passe
export const resetPassword = async (req, res) => {
  const { jeton, password } = req.body;
  await accountService.reinitialiserMotDePasse(jeton, password);

  return res.status(200).json({ message: 'Mot de passe modifié' });
};

// Fonction Mise à jour de l'utilisateur
export const updateUser = async (req, res) => {
  const id = req.user.id;
  const { result, token, user } = await authService.updateUser(id, req.body, req.user.sid);

  // Les informations du jeton ont changé : on repose le cookie avec le nouveau
  if (token) {
    res.cookie(COOKIE_NAME, token, cookieOptions());
  }

  return res.status(200).json({ message: 'Utilisateur modifié avec succès', result, user });
};

// Fonction Mise à jour de l'avatar
export const updateAvatar = async (req, res) => {
  const user_id = req.user.id;

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'devproject/avatar' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    stream.end(req.file.buffer);
  });
  const avatar = uploadResult.secure_url;
  const { result, token } = await authService.updateAvatar(user_id, avatar, req.user.sid);

  if (token) {
    res.cookie(COOKIE_NAME, token, cookieOptions());
  }

  return res.status(200).json({ message: 'Avatar mis à jour', avatar, result });
};
