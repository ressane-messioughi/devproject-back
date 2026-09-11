import db from '../config/db.js';

// Fonction pour récupérer toutes les tâches d'un projet, avec les infos de la personne
// à qui elle est confiée (username, avatar)
const findAll = async (project_id) => {
  const sql = `SELECT t.id_task, t.title, t.description, t.status, t.created_at, t.assigned_to,
t.sprint_id, t.project_id,
u.username, u.avatar
FROM task t
JOIN users u ON t.assigned_to = u.id
WHERE t.project_id = ?
ORDER BY t.created_at DESC`;
  const [result] = await db.execute(sql, [project_id]);
  return result;
};

// Fonction pour créer une tâche
const create = async (title, description, status, assigned_to, project_id, sprint_id = null) => {
  const sql =
    'INSERT INTO task (title,description,status,assigned_to,project_id,sprint_id) VALUES (?,?,?,?,?,?)';
  const [result] = await db.execute(sql, [
    title,
    description,
    status,
    assigned_to,
    project_id,
    sprint_id,
  ]);
  return result;
};

// Fonction pour mettre à jour une tâche
const update = async (id_task, title, description, status, assigned_to, sprint_id) => {
  const sql =
    'UPDATE task SET title = ?, description = ?, status = ?, assigned_to = ?, sprint_id = ? WHERE id_task = ?';
  const [result] = await db.execute(sql, [
    title,
    description,
    status,
    assigned_to,
    sprint_id,
    id_task,
  ]);
  return result;
};

// Fonction pour supprimer une tâche
const remove = async (id_task) => {
  const sql = 'DELETE FROM task WHERE id_task = ?';
  const [result] = await db.execute(sql, [id_task]);
  return result;
};
// Fonction pour supprimer toutes les tâches d'un projet
const removeByProjectId = async (project_id) => {
  const sql = 'DELETE FROM task WHERE project_id = ?';
  const [result] = await db.execute(sql, [project_id]);
  return result;
};

export default {
  findAll,
  create,
  update,
  remove,
  removeByProjectId,
};
