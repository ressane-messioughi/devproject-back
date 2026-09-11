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

export default {
  findAllByProject,
  findById,
  create,
  updateName,
  remove,
  removeByProjectId,
};
