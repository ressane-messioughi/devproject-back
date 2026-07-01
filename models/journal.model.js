import db from '../config/db.js';

// Fonction pour récupérer tous les journaux d'un projet
const findAllByProject = async (project_id) => {
  const sql = `SELECT j.id_journal, j.title, j.message, j.created_at, u.id, u.firstname, u.lastname, u.username, u.avatar FROM journal j JOIN Users u ON j.users_id = u.id WHERE j.project_id = ?  ORDER BY j.created_at DESC
`;
  const [result] = await db.execute(sql, [project_id]);
  return result;
};

// Fonction pour créer un journal
const create = async (title, message, project_id, users_id) => {
  const sql = 'INSERT INTO journal (title, message, project_id, users_id) VALUES (?,?,?,?)';
  const [result] = await db.execute(sql, [title, message, project_id, users_id]);
  return result;
};

// Fonction pour supprimer un journal
const remove = async (id_journal) => {
  const sql = 'DELETE FROM journal WHERE id_journal = ?';
  const [result] = await db.execute(sql, [id_journal]);
  return result;
};

export default {
  findAllByProject,
  create,
  remove,
};
