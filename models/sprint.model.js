import db from '../config/db.js';

// Fonction pour récupérer tous les sprints d'un projet
const findAllByProject = async (project_id) => {
  const sql = 'SELECT * FROM sprint WHERE project_id = ?';
  const [result] = await db.execute(sql, [project_id]);
  return result;
};

// Fonction pour créer un sprint
const create = async (name, start_date, end_date, status, project_id) => {
  const sql =
    'INSERT INTO sprint (name, start_date, end_date, status, project_id) VALUES (?,?,?,?,?)';
  const [result] = await db.execute(sql, [name, start_date, end_date, status, project_id]);
  return result;
};

// Fonction pour mettre à jour un sprint
const update = async (id_sprint, name, start_date, end_date, status) => {
  const sql =
    'UPDATE sprint SET name = ?, start_date = ?, end_date = ?, status = ? WHERE id_sprint = ?';
  const [result] = await db.execute(sql, [name, start_date, end_date, status, id_sprint]);
  return result;
};

// Fonction pour supprimer un sprint
const remove = async (id_sprint) => {
  const sql = 'DELETE FROM sprint WHERE id_sprint = ?';
  const [result] = await db.execute(sql, [id_sprint]);
  return result;
};

// Fonction pour récupérer un sprint par son ID
const findById = async (id_sprint) => {
  const sql = 'SELECT * FROM sprint WHERE id_sprint = ?';
  const [result] = await db.execute(sql, [id_sprint]);
  return result;
};
export default {
  findAllByProject,
  create,
  update,
  remove,
  findById,
};
