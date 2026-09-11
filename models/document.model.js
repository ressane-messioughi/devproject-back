import db from '../config/db.js';

// Fonction pour récupérer tous les documents d'un projet, avec les infos de la personne
// qui l'a déposé (username, avatar)
const findAllByProject = async (project_id) => {
  const sql = `SELECT d.id_document, d.name, d.description, d.file_url, d.file_name,
d.file_size, d.file_type, d.created_at, d.project_id, d.uploaded_by,
u.username, u.avatar
FROM document d
JOIN users u ON d.uploaded_by = u.id
WHERE d.project_id = ?
ORDER BY d.created_at DESC`;
  const [result] = await db.execute(sql, [project_id]);
  return result;
};

// Fonction pour récupérer un document par son ID
const findById = async (id_document) => {
  const sql = 'SELECT * FROM document WHERE id_document = ?';
  const [result] = await db.execute(sql, [id_document]);
  return result[0];
};

// Fonction pour créer un document
const create = async (name, description, fichier, project_id, uploaded_by) => {
  const sql =
    'INSERT INTO document (name, description, file_url, file_name, file_size, file_type, project_id, uploaded_by) VALUES (?,?,?,?,?,?,?,?)';
  const [result] = await db.execute(sql, [
    name,
    description ?? null,
    fichier.file_url,
    fichier.file_name,
    fichier.file_size ?? null,
    fichier.file_type ?? null,
    project_id,
    uploaded_by,
  ]);
  return result;
};

// Fonction pour renommer un document et changer sa description
// (uniquement la personne qui l'a déposé, voir document.service.js)
const updateDetails = async (id_document, name, description) => {
  const sql = 'UPDATE document SET name = ?, description = ? WHERE id_document = ?';
  const [result] = await db.execute(sql, [name, description ?? null, id_document]);
  return result;
};

// Fonction pour supprimer un document
const remove = async (id_document) => {
  const sql = 'DELETE FROM document WHERE id_document = ?';
  const [result] = await db.execute(sql, [id_document]);
  return result;
};

// Fonction pour supprimer tous les documents d'un projet
const removeByProjectId = async (project_id) => {
  const sql = 'DELETE FROM document WHERE project_id = ?';
  const [result] = await db.execute(sql, [project_id]);
  return result;
};

export default {
  findAllByProject,
  findById,
  create,
  updateDetails,
  remove,
  removeByProjectId,
};
