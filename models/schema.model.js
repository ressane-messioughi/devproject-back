import db from '../config/db.js';

// Fonction pour récupérer tous les schémas d'un projet
const findAll = async (id_project) => {
  const sql = 'SELECT * FROM schema WHERE id_project = ?';
  const result = await db.execute(sql, [id_project]);
  return result;
};

// Fonction pour récupérer un schéma par son ID et l'ID du projet
const findById = async (id_project, id_schema) => {
  const sql = 'SELECT * FROM schema WHERE id_project = ? AND id_schema = ?';
  const result = await db.execute(sql, [id_project, id_schema]);
  return result;
};
export default {
  findAll,
  findById,
};
