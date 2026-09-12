import db from '../config/db.js';

// Fonction pour trouver un utilisateur par email
const findByEmail = async (email) => {
  const sql = 'SELECT * FROM users WHERE email = ?';
  const [result] = await db.execute(sql, [email]);
  return result;
};

// Fonction pour enregistrer un nouvel utilisateur
const register = async (
  firstname,
  lastname,
  username,
  email,
  hashedPassword,
  avatar,
  city,
  phone,
  role,
) => {
  // consent_at reçoit NOW() : le RGPD demande de pouvoir prouver quand la personne a
  // donné son accord, pas seulement qu'elle l'a donné.
  const sql =
    'INSERT INTO users (firstname, lastname, username, email, password, avatar, city, phone, role, consent_at) VALUES (?,?,?,?,?,?,?,?,?,NOW())';
  const [result] = await db.execute(sql, [
    firstname,
    lastname,
    username || 'User',
    email,
    hashedPassword,
    avatar || "https://res.cloudinary.com/dq7papymj/image/upload/v1788646671/abstract-user-flat-4_b0fzms.webp",
    city || null,
    phone || null,
    role || 'USER',
  ]);
  return result;
};

// Fonction pour mettre à jour les informations d'un utilisateur
const update = async (sql, values) => {
  return await db.execute(sql, values);
};

// Fonction pour mettre à jour l'avatar d'un utilisateur
const updateAvatar = async (user_id, avatar) => {
  const sql = 'UPDATE users SET avatar = ? WHERE id = ?';
  const [result] = await db.execute(sql, [avatar, user_id]);
  return result;
};

// Fonction pour trouver un utilisateur par son ID
const findById = async (user_id) => {
  const sql =
    'SELECT id, firstname, lastname, username, email, role, avatar, phone, city FROM users WHERE id = ?';
  const [result] = await db.execute(sql, [user_id]);
  return result[0];
};
// Fonction pour marquer une adresse comme confirmée
const confirmerEmail = async (user_id) => {
  const sql = 'UPDATE users SET email_verified_at = NOW() WHERE id = ?';
  const [result] = await db.execute(sql, [user_id]);
  return result;
};

// Fonction pour noter que le message de bienvenue est parti.
// La condition sur NULL garantit qu'il ne parte pas deux fois, même si la
// confirmation est rejouée : c'est la base qui arbitre, pas le code appelant.
const marquerBienvenueEnvoyee = async (user_id) => {
  const sql =
    'UPDATE users SET welcome_sent_at = NOW() WHERE id = ? AND welcome_sent_at IS NULL';
  const [result] = await db.execute(sql, [user_id]);
  return result;
};

// Fonction pour remplacer le mot de passe
const updatePassword = async (user_id, hashedPassword) => {
  const sql = 'UPDATE users SET password = ? WHERE id = ?';
  const [result] = await db.execute(sql, [hashedPassword, user_id]);
  return result;
};

export default {
  findByEmail,
  register,
  update,
  updateAvatar,
  findById,
  confirmerEmail,
  marquerBienvenueEnvoyee,
  updatePassword,
};
