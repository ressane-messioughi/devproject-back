import db from '../config/db.js';

// Fonction pour récupérer tous les tickets, avec leur auteur et qui a répondu
const findAll = async () => {
  const sql = `SELECT t.id_ticket, t.subject, t.message, t.category, t.status, t.created_at,
t.answered_at, t.answer, t.users_id, t.answered_by,
u.username, u.avatar, u.email,
a.username AS answered_by_username
FROM support_ticket t
JOIN users u ON u.id = t.users_id
LEFT JOIN users a ON a.id = t.answered_by
ORDER BY FIELD(t.status, 'OUVERT', 'EN COURS', 'RESOLU'), t.created_at DESC`;
  const [result] = await db.execute(sql);
  return result;
};

// Fonction pour récupérer les tickets d'une personne
const findByUser = async (users_id) => {
  const sql = `SELECT t.id_ticket, t.subject, t.message, t.category, t.status, t.created_at,
t.answered_at, t.answer,
a.username AS answered_by_username
FROM support_ticket t
LEFT JOIN users a ON a.id = t.answered_by
WHERE t.users_id = ?
ORDER BY t.created_at DESC`;
  const [result] = await db.execute(sql, [users_id]);
  return result;
};

// Fonction pour récupérer un ticket par son ID
const findById = async (id_ticket) => {
  const sql = 'SELECT * FROM support_ticket WHERE id_ticket = ?';
  const [result] = await db.execute(sql, [id_ticket]);
  return result[0];
};

// Fonction pour ouvrir un ticket
const create = async (subject, message, category, users_id) => {
  const sql =
    'INSERT INTO support_ticket (subject, message, category, users_id) VALUES (?,?,?,?)';
  const [result] = await db.execute(sql, [subject, message, category, users_id]);
  return result;
};

// Fonction pour répondre à un ticket et changer son statut.
// answered_at et answered_by ne sont posés qu'avec une réponse : un simple changement
// de statut ne doit pas faire croire qu'une réponse a été écrite.
const answer = async (id_ticket, status, reponse, answered_by) => {
  const sql = reponse
    ? 'UPDATE support_ticket SET status = ?, answer = ?, answered_at = NOW(), answered_by = ? WHERE id_ticket = ?'
    : 'UPDATE support_ticket SET status = ? WHERE id_ticket = ?';

  const valeurs = reponse
    ? [status, reponse, answered_by, id_ticket]
    : [status, id_ticket];

  const [result] = await db.execute(sql, valeurs);
  return result;
};

// Fonction pour supprimer un ticket
const remove = async (id_ticket) => {
  const sql = 'DELETE FROM support_ticket WHERE id_ticket = ?';
  const [result] = await db.execute(sql, [id_ticket]);
  return result;
};

export default { findAll, findByUser, findById, create, answer, remove };
