import db from '../config/db.js';

// Fonction pour créer une équipe
const create = async (name, project_id) => {
  const sql = 'INSERT INTO team (name,project_id,created_at) VALUES (?, ?, NOW())';
  const [result] = await db.execute(sql, [name, project_id]);
  return result;
};

// Fonction pour ajouter un utilisateur à une équipe
const addUserToTeam = async (users_id, team_id, role) => {
  const sql = 'INSERT INTO team_user (users_id, team_id, joined_at, role) VALUES (?,?,NOW(), ?)';
  const [result] = await db.execute(sql, [users_id, team_id, role]);
  return result;
};

// Fonction pour récupérer une équipe par l'ID du projet
const findByProjectId = async (project_id) => {
  const sql = 'SELECT * FROM team WHERE project_id = ?';
  const [result] = await db.execute(sql, [project_id]);
  return result[0];
};

// Fonction pour récupérer les utilisateurs d'une équipe par l'ID du projet
const getUserTeam = async (project_id) => {
  const sql = `SELECT u.id,u.firstname,u.lastname,u.username,u.avatar,u.phone,u.city,tu.role,tu.team_role FROM team_user tu JOIN users u ON tu.users_id = u.id JOIN team t ON tu.team_id = t.id_team WHERE t.project_id = ?`;
  const [result] = await db.execute(sql, [project_id]);
  return result;
};

// Fonction pour récupérer le role d'un utilisateur dans une équipe
const getUserRole = async (users_id, team_id) => {
  const sql = 'SELECT role, team_role FROM team_user WHERE users_id = ? AND team_id = ?';
  const [result] = await db.execute(sql, [users_id, team_id]);
  return result[0];
};

// Fonction pour modifier le team_role d'un utilisateur dans une équipe
const updateTeamRole = async (users_id, team_id, team_role) => {
  const sql = 'UPDATE team_user SET team_role = ? WHERE users_id = ? AND team_id = ?';
  const [result] = await db.execute(sql, [team_role, users_id, team_id]);
  return result;
};

// Fonction pour supprimer un utilisateur d'une équipe
const removeTeamUser = async (users_id, team_id) => {
  const sql = ' DELETE FROM team_user WHERE users_id = ? AND team_id = ?';
  const result = await db.execute(sql, [users_id, team_id]);
  return result;
};
// Fonction pour supprimer tous les membres d'une équipe
const removeAllTeamUsers = async (team_id) => {
  const sql = 'DELETE FROM team_user WHERE team_id = ?';
  const [result] = await db.execute(sql, [team_id]);
  return result;
};

// Fonction pour supprimer une équipe
const removeTeam = async (team_id) => {
  const sql = 'DELETE FROM team WHERE id_team = ?';
  const [result] = await db.execute(sql, [team_id]);
  return result;
};

export default {
  create,
  addUserToTeam,
  findByProjectId,
  getUserTeam,
  removeTeamUser,
  getUserRole,
  updateTeamRole,
  removeAllTeamUsers,
  removeTeam,
};
