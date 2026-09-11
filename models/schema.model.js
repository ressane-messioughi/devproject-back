import db from '../config/db.js';

// Fonction pour récupérer tous les schémas d'un projet, avec les infos de la personne
// qui l'a déposé (username, avatar)
// "schema" est un mot réservé de MySQL : sans les backticks, la requête renvoie une erreur 1064
const findAllByProject = async (project_id) => {
  const sql = `SELECT s.id_schema, s.name, s.file_url, s.created_at, s.project_id, s.uploaded_by,
u.username, u.avatar
FROM \`schema\` s
JOIN users u ON s.uploaded_by = u.id
WHERE s.project_id = ?
ORDER BY s.created_at DESC`;
  const [result] = await db.execute(sql, [project_id]);
  return result;
};

// Fonction pour récupérer un schéma par son ID
const findById = async (id_schema) => {
  const sql = 'SELECT * FROM `schema` WHERE id_schema = ?';
  const [result] = await db.execute(sql, [id_schema]);
  return result[0];
};

// Fonction pour créer un schéma
const create = async (name, file_url, project_id, uploaded_by) => {
  const sql =
    'INSERT INTO `schema` (name, file_url, created_at, project_id, uploaded_by) VALUES (?,?,NOW(),?,?)';
  const [result] = await db.execute(sql, [name, file_url, project_id, uploaded_by]);
  return result;
};

// Fonction pour renommer un schéma (uniquement la personne qui l'a déposé, voir schema.service.js)
const updateName = async (id_schema, name) => {
  const sql = 'UPDATE `schema` SET name = ? WHERE id_schema = ?';
  const [result] = await db.execute(sql, [name, id_schema]);
  return result;
};

// Fonction pour supprimer un schéma
const remove = async (id_schema) => {
  const sql = 'DELETE FROM `schema` WHERE id_schema = ?';
  const [result] = await db.execute(sql, [id_schema]);
  return result;
};

// Fonction pour supprimer tous les schémas d'un projet
const removeByProjectId = async (project_id) => {
  const sql = 'DELETE FROM `schema` WHERE project_id = ?';
  const [result] = await db.execute(sql, [project_id]);
  return result;
};

// Fonction pour recuperer les commentaires d'un schema, avec l'auteur de chacun
const findCommentsBySchema = async (schema_id) => {
  const sql = `SELECT c.id_comment, c.message, c.created_at, c.schema_id, c.users_id,
u.username, u.avatar
FROM schema_comment c
JOIN users u ON c.users_id = u.id
WHERE c.schema_id = ?
ORDER BY c.created_at ASC`;
  const [result] = await db.execute(sql, [schema_id]);
  return result;
};

// Fonction pour ajouter un commentaire sur un schema
const createComment = async (message, schema_id, users_id) => {
  const sql = 'INSERT INTO schema_comment (message, schema_id, users_id) VALUES (?,?,?)';
  const [result] = await db.execute(sql, [message, schema_id, users_id]);
  return result;
};

// Fonction pour supprimer un commentaire
const removeComment = async (id_comment) => {
  const sql = 'DELETE FROM schema_comment WHERE id_comment = ?';
  const [result] = await db.execute(sql, [id_comment]);
  return result;
};

// Fonction pour recuperer un commentaire par son ID
const findCommentById = async (id_comment) => {
  const sql = 'SELECT * FROM schema_comment WHERE id_comment = ?';
  const [result] = await db.execute(sql, [id_comment]);
  return result[0];
};

// Fonction pour recuperer les approbations de tous les schemas d'un projet.
// Une seule requete pour l'ensemble du projet : la galerie affiche les avatars des
// approbateurs sur chaque miniature, la faire schema par schema multiplierait les allers-retours.
const findApprovalsByProject = async (project_id) => {
  const sql = `SELECT a.schema_id, a.users_id, a.approved_at, u.username, u.avatar
FROM schema_approval a
JOIN users u ON a.users_id = u.id
JOIN \`schema\` s ON s.id_schema = a.schema_id
WHERE s.project_id = ?
ORDER BY a.approved_at ASC`;
  const [result] = await db.execute(sql, [project_id]);
  return result;
};

// Fonction pour approuver un schema.
// La cle primaire porte sur le couple (schema_id, users_id) : INSERT IGNORE rend
// l'appel sans effet si la personne a deja approuve, au lieu de lever l'erreur 1062.
const createApproval = async (schema_id, users_id) => {
  const sql = 'INSERT IGNORE INTO schema_approval (schema_id, users_id) VALUES (?,?)';
  const [result] = await db.execute(sql, [schema_id, users_id]);
  return result;
};

// Fonction pour retirer son approbation d'un schema
const removeApproval = async (schema_id, users_id) => {
  const sql = 'DELETE FROM schema_approval WHERE schema_id = ? AND users_id = ?';
  const [result] = await db.execute(sql, [schema_id, users_id]);
  return result;
};

export default {
  findAllByProject,
  findById,
  create,
  updateName,
  remove,
  removeByProjectId,
  findCommentsBySchema,
  createComment,
  removeComment,
  findCommentById,
  findApprovalsByProject,
  createApproval,
  removeApproval,
};
