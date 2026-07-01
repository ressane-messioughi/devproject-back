import db from '../config/db.js';

// Fonction pour trouver un utilisateur par email
const findByEmail = async (email) => {
  const sql = 'SELECT * FROM Users WHERE email = ?';
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
  const sql =
    'INSERT INTO Users (firstname, lastname, username, email, password, avatar, city, phone, role) VALUES (?,?,?,?,?,?,?,?,?)';
  const [result] = await db.execute(sql, [
    firstname,
    lastname,
    username || 'User',
    email,
    hashedPassword,
    avatar || null,
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
  const sql = 'UPDATE Users SET avatar = ? WHERE id = ?';
  const [result] = await db.execute(sql, [avatar, user_id]);
  return result;
};

// Fonction pour trouver un utilisateur par son ID
const findById = async (user_id) => {
  const sql =
    'SELECT id, firstname, lastname, username, email, role, avatar, phone, city FROM Users WHERE id = ?';
  const [result] = await db.execute(sql, [user_id]);
  return result[0];
};
export default {
  findByEmail,
  register,
  update,
  updateAvatar,
  findById,
};
