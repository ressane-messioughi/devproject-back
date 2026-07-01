import db from '../config/db.js';

// Fonction pour récupérer tous les bugs d'un projet
const findAllByProject = async (project_id) => {
  const sql = 'SELECT * FROM bug WHERE project_id = ?';
  const result = await db.execute(sql, [project_id]);
  return result;
};

// Fonction pour créer un bug
const create = async (title, description, status, file_url, project_id, created_by) => {
  const sql =
    'INSERT INTO bug (title, description, status, file_url, project_id, created_by) VALUES (?,?,?,?,?,?)';
  const result = db.execute(sql, [title, description, status, file_url, project_id, created_by]);
  return result;
};

// Fonction pour mettre à jour un bug
const update = async (id_bug, title, description, status, file_url) => {
  const sql =
    'UPDATE bug SET title = ?, description = ?, status = ?, file_url = ? WHERE id_bug = ?';
  const result = await db.execute(sql, [id_bug, title, description, status, file_url]);
  return result;
};

// Fonction pour supprimer un bug
const remove = async (id_bug) => {
  const sql = 'DELETE FROM bug WHERE id_bug = ?';
  const result = await db.execute(sql, [id_bug]);
  return result;
};

export default {
  findAllByProject,
  create,
  update,
  remove,
};
