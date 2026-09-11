import authService from '../services/auth.service.js';
import cloudinary from '../config/cloudinary.js';
import { COOKIE_NAME, cookieOptions, clearCookieOptions } from '../middleware/cookie.middleware.js';

// Fonction Connexion
// Le jeton n'est plus renvoyé dans le corps de la réponse : il est posé dans un cookie
// httpOnly, que le navigateur renverra tout seul à chaque requête et que le JavaScript
// de la page ne peut pas lire.
export const login = async (req, res) => {
  const { email, password } = req.body;
  const { token, user } = await authService.loginUser({ email, password });

  res.cookie(COOKIE_NAME, token, cookieOptions());

  return res.status(200).json({ message: 'Connexion réussie', user });
};

// Fonction Déconnexion
// Le navigateur ne peut pas supprimer un cookie httpOnly : seul le serveur le peut.
export const logout = async (req, res) => {
  res.clearCookie(COOKIE_NAME, clearCookieOptions());
  return res.status(200).json({ message: 'Déconnexion réussie' });
};

// Fonction qui renvoie l'utilisateur de la session en cours.
// Elle remplace le décodage du jeton côté navigateur : celui-ci n'y a plus accès, c'est
// donc le serveur qui dit qui est connecté.
export const me = async (req, res) => {
  return res.status(200).json({ user: req.user });
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
  return res.status(201).json({ message: 'Utilisateur créé avec succès', user: { id: user.insertId } });
};

// Fonction Mise à jour de l'utilisateur
export const updateUser = async (req, res) => {
  const id = req.user.id;
  const { result, token, user } = await authService.updateUser(id, req.body);

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
  const { result, token } = await authService.updateAvatar(user_id, avatar);

  if (token) {
    res.cookie(COOKIE_NAME, token, cookieOptions());
  }

  return res.status(200).json({ message: 'Avatar mis à jour', avatar, result });
};
