import db from '../config/db.js';

// Fonction pour récupérer le daily courant d'un projet.
//
// Un seul est pertinent à la fois : celui qui est en cours, sinon le prochain planifié.
// L'ordre de tri place donc "EN COURS" avant "PLANIFIE", puis le plus proche dans le temps.
const findCurrentByProject = async (project_id) => {
  const sql = `SELECT d.id_daily, d.scheduled_at, d.duration_minutes, d.mode, d.link,
d.location, d.note, d.status, d.started_at, d.ended_at, d.project_id, d.created_by,
u.username, u.avatar
FROM daily d
JOIN users u ON u.id = d.created_by
WHERE d.project_id = ? AND d.status <> 'TERMINE'
ORDER BY FIELD(d.status, 'EN COURS', 'PLANIFIE'), d.scheduled_at ASC
LIMIT 1`;
  const [result] = await db.execute(sql, [project_id]);
  return result[0] ?? null;
};

// Fonction pour récupérer un daily par son ID
const findById = async (id_daily) => {
  const sql = 'SELECT * FROM daily WHERE id_daily = ?';
  const [result] = await db.execute(sql, [id_daily]);
  return result[0];
};

// Fonction pour planifier un daily
const create = async (donnees, project_id, created_by) => {
  const sql =
    'INSERT INTO daily (scheduled_at, duration_minutes, mode, link, location, note, project_id, created_by) VALUES (?,?,?,?,?,?,?,?)';
  const [result] = await db.execute(sql, [
    donnees.scheduled_at,
    donnees.duration_minutes ?? 15,
    donnees.mode,
    donnees.link ?? null,
    donnees.location ?? null,
    donnees.note ?? null,
    project_id,
    created_by,
  ]);
  return result;
};

// Fonction pour modifier un daily planifié
const update = async (id_daily, donnees) => {
  const sql =
    'UPDATE daily SET scheduled_at = ?, duration_minutes = ?, mode = ?, link = ?, location = ?, note = ? WHERE id_daily = ?';
  const [result] = await db.execute(sql, [
    donnees.scheduled_at,
    donnees.duration_minutes ?? 15,
    donnees.mode,
    donnees.link ?? null,
    donnees.location ?? null,
    donnees.note ?? null,
    id_daily,
  ]);
  return result;
};

// Fonction pour lancer le daily.
// started_at est posé par le serveur et non envoyé par le navigateur : le minuteur
// affiché chez chaque membre doit partir du même instant pour tout le monde.
const start = async (id_daily) => {
  const sql = "UPDATE daily SET status = 'EN COURS', started_at = NOW() WHERE id_daily = ?";
  const [result] = await db.execute(sql, [id_daily]);
  return result;
};

// Fonction pour clore le daily
const end = async (id_daily) => {
  const sql = "UPDATE daily SET status = 'TERMINE', ended_at = NOW() WHERE id_daily = ?";
  const [result] = await db.execute(sql, [id_daily]);
  return result;
};

// Fonction pour annuler un daily
const remove = async (id_daily) => {
  const sql = 'DELETE FROM daily WHERE id_daily = ?';
  const [result] = await db.execute(sql, [id_daily]);
  return result;
};

// Fonction pour supprimer tous les points quotidiens d'un projet
const removeByProjectId = async (project_id) => {
  const sql = 'DELETE FROM daily WHERE project_id = ?';
  const [result] = await db.execute(sql, [project_id]);
  return result;
};

export default { findCurrentByProject, findById, create, update, start, end, remove, removeByProjectId };
