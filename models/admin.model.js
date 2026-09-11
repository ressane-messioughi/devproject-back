import db from '../config/db.js';

// Les requêtes de l'administration du site.
// Elles traversent les projets, là où tous les autres modèles filtrent sur un projet
// donné : c'est ce qui justifie un modèle à part plutôt que d'élargir les existants.

// Fonction pour récupérer tous les comptes, avec leur nombre de projets
const findAllUsers = async () => {
  const sql = `SELECT u.id, u.firstname, u.lastname, u.username, u.email, u.avatar, u.city,
u.phone, u.role, u.created_at, u.consent_at,
COUNT(DISTINCT t.project_id) AS projets
FROM users u
LEFT JOIN team_user tu ON tu.users_id = u.id
LEFT JOIN team t ON t.id_team = tu.team_id
GROUP BY u.id
ORDER BY u.created_at DESC`;
  const [result] = await db.execute(sql);
  return result;
};

// Fonction pour récupérer tous les projets, avec leur propriétaire et leurs volumes
const findAllProjects = async () => {
  const sql = `SELECT p.id_project, p.name, p.description, p.created_at, p.team_code,
o.username AS owner_username, o.avatar AS owner_avatar,
(SELECT COUNT(*) FROM team_user tu JOIN team t ON t.id_team = tu.team_id WHERE t.project_id = p.id_project) AS membres,
(SELECT COUNT(*) FROM bug WHERE project_id = p.id_project) AS bugs,
(SELECT COUNT(*) FROM journal WHERE project_id = p.id_project) AS notes,
(SELECT COUNT(*) FROM task WHERE project_id = p.id_project) AS taches,
(SELECT COUNT(*) FROM \`schema\` WHERE project_id = p.id_project) AS \`schemas\`,
(SELECT COUNT(*) FROM document WHERE project_id = p.id_project) AS documents
FROM project p
JOIN users o ON o.id = p.owner_id
ORDER BY p.created_at DESC`;
  const [result] = await db.execute(sql);
  return result;
};

// Fonction pour récupérer tous les schémas du site, tous projets confondus
const findAllSchemas = async () => {
  const sql = `SELECT s.id_schema, s.name, s.file_url, s.created_at,
p.id_project, p.name AS project_name,
u.username, u.avatar,
(SELECT COUNT(*) FROM schema_approval WHERE schema_id = s.id_schema) AS approbations,
(SELECT COUNT(*) FROM schema_comment WHERE schema_id = s.id_schema) AS commentaires
FROM \`schema\` s
JOIN users u ON u.id = s.uploaded_by
LEFT JOIN project p ON p.id_project = s.project_id
ORDER BY s.created_at DESC`;
  const [result] = await db.execute(sql);
  return result;
};

// Fonction pour récupérer tous les journaux, groupés côté application par équipe
const findAllJournals = async () => {
  const sql = `SELECT j.id_journal, j.title, j.message, j.created_at,
p.id_project, p.name AS project_name,
t.name AS team_name,
u.username, u.avatar
FROM journal j
JOIN users u ON u.id = j.users_id
LEFT JOIN project p ON p.id_project = j.project_id
LEFT JOIN team t ON t.project_id = j.project_id
ORDER BY p.name ASC, j.created_at DESC`;
  const [result] = await db.execute(sql);
  return result;
};

// Fonction pour compter les grandes masses du site en une seule requête.
// Une sous-requête par table plutôt qu'un appel par compteur : un seul aller-retour
// vers la base au lieu de dix.
const getKpi = async () => {
  const sql = `SELECT
(SELECT COUNT(*) FROM users) AS utilisateurs,
(SELECT COUNT(*) FROM users WHERE role = 'ADMIN') AS administrateurs,
(SELECT COUNT(*) FROM project) AS projets,
(SELECT COUNT(*) FROM team_user) AS adhesions,
(SELECT COUNT(*) FROM journal) AS notes,
(SELECT COUNT(*) FROM bug) AS bugs,
(SELECT COUNT(*) FROM bug WHERE status = 'BUG') AS bugs_ouverts,
(SELECT COUNT(*) FROM bug WHERE status = 'OK') AS bugs_resolus,
(SELECT COUNT(*) FROM task) AS taches,
(SELECT COUNT(*) FROM task WHERE status = 'FAIT') AS taches_faites,
(SELECT COUNT(*) FROM sprint) AS sprints,
(SELECT COUNT(*) FROM \`schema\`) AS \`schemas\`,
(SELECT COUNT(*) FROM document) AS documents,
(SELECT COALESCE(SUM(file_size), 0) FROM document) AS poids_documents,
(SELECT COUNT(*) FROM join_request WHERE status = 'PENDING') AS demandes_en_attente,
(SELECT COUNT(*) FROM support_ticket WHERE status = 'OUVERT') AS tickets_ouverts`;
  const [result] = await db.execute(sql);
  return result[0];
};

// Fonction pour compter les inscriptions des douze derniers mois.
// DATE_FORMAT groupe par mois, et l'ordre chronologique permet de tracer la courbe
// sans retraitement côté navigateur.
const getInscriptionsParMois = async () => {
  const sql = `SELECT DATE_FORMAT(created_at, '%Y-%m') AS mois, COUNT(*) AS total
FROM users
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY mois
ORDER BY mois ASC`;
  const [result] = await db.execute(sql);
  return result;
};

// Fonction pour compter les projets créés par mois, sur la même période
const getProjetsParMois = async () => {
  const sql = `SELECT DATE_FORMAT(created_at, '%Y-%m') AS mois, COUNT(*) AS total
FROM project
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY mois
ORDER BY mois ASC`;
  const [result] = await db.execute(sql);
  return result;
};

// Fonction pour connaître la répartition des rôles dans les équipes
const getRepartitionRoles = async () => {
  const sql = `SELECT COALESCE(team_role, 'Non renseigné') AS role, COUNT(*) AS total
FROM team_user
GROUP BY team_role
ORDER BY total DESC`;
  const [result] = await db.execute(sql);
  return result;
};

export default {
  findAllUsers,
  findAllProjects,
  findAllSchemas,
  findAllJournals,
  getKpi,
  getInscriptionsParMois,
  getProjetsParMois,
  getRepartitionRoles,
};
