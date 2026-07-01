import db from '../config/db.js';

// Fonction pour récupérer toutes les tâches d'un projet
const findAll = async (project_id) => {
  const sql = 'SELECT * FROM task WHERE project_id = ?';
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
export default {
  findAll,
  create,
  update,
  remove,
};
