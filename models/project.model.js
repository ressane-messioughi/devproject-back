import db from '../config/db.js';

// Fonction pour récupérer tous les projets
const findAll = async () => {
  const sql = 'SELECT * FROM project';
  const [result] = await db.execute(sql);
  return result;
};

// Fonction pour récupérer un projet par son ID
const findById = async (id_project) => {
  const sql = 'SELECT * FROM project WHERE id_project = ?';
  const [result] = await db.execute(sql, [id_project]);
  return result;
};

// Fonction pour récupérer tous les projets d'un utilisateur par son ID
const findByUserId = async (user_id) => {
  const sql = `SELECT DISTINCT p.*, t.id_team AS team_id, tu.role FROM Project p INNER JOIN Team t ON t.project_id = p.id_project INNER JOIN TEAM_USER tu ON tu.team_id = t.id_team WHERE tu.users_id = ?`;
  const [result] = await db.execute(sql, [user_id]);
  return result;
};

// Fonction pour créer un projet
const create = async (name, description, owner_id, team_code) => {
  const sql = 'INSERT INTO project (name,description,owner_id,team_code) VALUES (?,?,?,?)';
  const [result] = await db.execute(sql, [name, description, owner_id, team_code]);
  return result;
};

// Fonction pour mettre à jour un projet
const update = async (name, description, id_project) => {
  const sql = 'UPDATE project SET name = ?, description = ? WHERE id_project = ?';
  const [result] = await db.execute(sql, [name, description, id_project]);
  return result;
};

// Fonction pour supprimer un projet
const remove = async (id_project) => {
  const sql = 'DELETE FROM project WHERE id_project = ?';
  const [result] = await db.execute(sql, [id_project]);
  return result;
};
export default {
  findAll,
  findById,
  findByUserId,
  create,
  update,
  remove,
};
