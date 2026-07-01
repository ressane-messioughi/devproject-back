import db from '../config/db.js';

// Fonction pour trouver un projet par son code d'équipe
const findProjectByTeamCode = async (team_code) => {
  const sql = 'SELECT * FROM project WHERE team_code = ?';
  const [result] = await db.execute(sql, [team_code]);
  return result[0];
};

// Fonction pour créer une demande de rejoindre un projet
const create = async (project_id, user_id) => {
  const sql = `INSERT INTO join_request (project_id, user_id, status) VALUES (?,?,'PENDING')`;
  const result = await db.execute(sql, [project_id, user_id]);
  return result;
};

// Fonction pour récupérer toutes les demandes de rejoindre un projet par son ID
const findAllProjectById = async (project_id) => {
  const sql = `
    SELECT
      jr.id_request,
      jr.status,

      u.id,
      u.firstname,
      u.lastname,
      u.username,
      u.email,
      u.avatar,
      u.city,
      u.phone,

      jr.created_at

    FROM join_request jr
    JOIN Users u ON jr.user_id = u.id
    WHERE jr.project_id = ?
  `;
  const [result] = await db.execute(sql, [project_id]);
  console.log(result);
  return result;
};

// Fonction pour mettre à jour le statut d'une demande de rejoindre un projet
const updateStatus = async (id_request, status) => {
  const sql = 'UPDATE join_request SET status = ? WHERE id_request = ?';
  const [result] = await db.execute(sql, [status, id_request]);
  return result;
};

// Fonction pour trouver une demande de rejoindre un projet par son ID
const findById = async (id_request) => {
  const sql = `SELECT jr.id_request,
      jr.project_id,
      jr.user_id,
      jr.status,
      jr.created_at,
      u.firstname,
      u.lastname,
      u.username,
      u.avatar
    FROM join_request jr
    JOIN Users u ON jr.user_id = u.id
    WHERE jr.id_request = ? `;
  const [result] = await db.execute(sql, [id_request]);
  return result[0];
};

export default {
  findProjectByTeamCode,
  create,
  findAllProjectById,
  updateStatus,
  findById,
};
