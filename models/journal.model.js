import db from '../config/db.js';

// Fonction pour récupérer tous les journaux d'un projet
const findAllByProject = async (project_id) => {
  const sql = `SELECT j.id_journal, j.title, j.message, j.created_at, u.id, u.firstname, u.lastname, u.username, u.avatar, tu.team_role
FROM journal j
JOIN users u ON j.users_id = u.id
LEFT JOIN team t ON t.project_id = j.project_id
LEFT JOIN team_user tu ON tu.team_id = t.id_team AND tu.users_id = j.users_id
WHERE j.project_id = ?
ORDER BY j.created_at DESC
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

// Fonction pour récupérer un journal par son ID
const findById = async (id_journal) => {
  const sql = 'SELECT * FROM journal WHERE id_journal = ?';
  const [result] = await db.execute(sql, [id_journal]);
  return result[0];
};

// Fonction pour modifier un journal
const update = async (id_journal, title, message) => {
  const sql = 'UPDATE journal SET title = ?, message = ? WHERE id_journal = ?';
  const [result] = await db.execute(sql, [title, message, id_journal]);
  return result;
};

// Fonction pour supprimer un journal
const remove = async (id_journal) => {
  const sql = 'DELETE FROM journal WHERE id_journal = ?';
  const [result] = await db.execute(sql, [id_journal]);
  return result;
};

// Fonction pour supprimer tous les journaux d'un projet
const removeByProjectId = async (project_id) => {
  const sql = 'DELETE FROM journal WHERE project_id = ?';
  const [result] = await db.execute(sql, [project_id]);
  return result;
};

export default {
  findAllByProject,
  create,
  findById,
  update,
  remove,
  removeByProjectId,
};
