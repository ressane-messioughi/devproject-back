import db from '../config/db.js';

// Fonction pour récupérer tous les dépôts GitHub d'un projet
const findAllByProject = async (project_id) => {
  const sql = 'SELECT * FROM github_repository WHERE project_id = ? ';
  const [result] = await db.execute(sql, [project_id]);
  return result;
};

// Fonction pour créer un dépôt GitHub
const create = async (name, url, branch, project_id) => {
  const sql = 'INSERT INTO github_repository (name,url,branch,project_id) VALUES (?,?,?,?)';
  const [result] = await db.execute(sql, [name, url, branch, project_id]);
  return result;
};

// Fonction pour mettre à jour un dépôt GitHub
const update = async (id_repository, name, url, branch) => {
  const sql = 'UPDATE github_repository SET name = ?, url = ?, branch = ? WHERE id_repository = ?';
  const [result] = await db.execute(sql, [name, url, branch, id_repository]);
  return result;
};

// Fonction pour supprimer un dépôt GitHub
const remove = async (id_repository) => {
  const sql = 'DELETE FROM github_repository WHERE id_repository = ?';
  const [result] = await db.execute(sql, [id_repository]);
  return result;
};
export default {
  findAllByProject,
  create,
  update,
  remove,
};
