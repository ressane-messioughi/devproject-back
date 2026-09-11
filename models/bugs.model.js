import db from '../config/db.js';

// Fonction pour récupérer tous les bugs d'un projet, avec les infos de l'auteur (avatar, team_role)
// et de la personne ayant changé le statut en dernier (updated_by)
const findAllByProject = async (project_id) => {
  const sql = `SELECT b.id_bug, b.title, b.description, b.status, b.file_url, b.file_name,
b.repository_id, b.file_path, b.line_start, b.line_end, b.created_at, b.project_id, b.created_by,
u.username, u.avatar, tu.team_role,
ub.username AS updated_by_username, ub.avatar AS updated_by_avatar,
r.name AS repository_name, r.url AS repository_url, r.branch AS repository_branch
FROM bug b
JOIN users u ON b.created_by = u.id
LEFT JOIN users ub ON b.updated_by = ub.id
LEFT JOIN github_repository r ON r.id_repository = b.repository_id
LEFT JOIN team t ON t.project_id = b.project_id
LEFT JOIN team_user tu ON tu.team_id = t.id_team AND tu.users_id = b.created_by
WHERE b.project_id = ?
ORDER BY b.created_at DESC`;
  const [result] = await db.execute(sql, [project_id]);
  return result;
};

// Fonction pour récupérer un bug par son ID
const findById = async (id_bug) => {
  const sql = 'SELECT * FROM bug WHERE id_bug = ?';
  const [result] = await db.execute(sql, [id_bug]);
  return result[0];
};

// Fonction pour créer un bug
const create = async (title, description, status, fichier, code, project_id, created_by) => {
  const sql =
    'INSERT INTO bug (title, description, status, file_url, file_name, repository_id, file_path, line_start, line_end, project_id, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
  const [result] = await db.execute(sql, [
    title,
    description,
    status,
    fichier.file_url ?? null,
    fichier.file_name ?? null,
    code.repository_id ?? null,
    code.file_path ?? null,
    code.line_start ?? null,
    code.line_end ?? null,
    project_id,
    created_by,
  ]);
  return result;
};

// Fonction pour modifier le titre et la description d'un bug (uniquement l'auteur, voir bugs.service.js)
const updateDetails = async (id_bug, title, description, code) => {
  const sql =
    'UPDATE bug SET title = ?, description = ?, repository_id = ?, file_path = ?, line_start = ?, line_end = ? WHERE id_bug = ?';
  const [result] = await db.execute(sql, [
    title,
    description,
    code.repository_id ?? null,
    code.file_path ?? null,
    code.line_start ?? null,
    code.line_end ?? null,
    id_bug,
  ]);
  return result;
};

// Fonction pour changer uniquement le statut d'un bug (n'importe quel membre de l'équipe)
const updateStatus = async (id_bug, status, updated_by) => {
  const sql = 'UPDATE bug SET status = ?, updated_by = ? WHERE id_bug = ?';
  const [result] = await db.execute(sql, [status, updated_by, id_bug]);
  return result;
};

// Fonction pour supprimer un bug
const remove = async (id_bug) => {
  const sql = 'DELETE FROM bug WHERE id_bug = ?';
  const [result] = await db.execute(sql, [id_bug]);
  return result;
};

// Fonction pour supprimer tous les bugs d'un projet
const removeByProjectId = async (project_id) => {
  const sql = 'DELETE FROM bug WHERE project_id = ?';
  const [result] = await db.execute(sql, [project_id]);
  return result;
};

export default {
  findAllByProject,
  findById,
  create,
  updateDetails,
  updateStatus,
  remove,
  removeByProjectId,
};
