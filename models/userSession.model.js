import db from '../config/db.js';

// Sessions ouvertes.
//
// Un JWT est valable tant qu'il n'a pas expiré, et rien côté serveur ne pouvait
// le contredire : un compte compromis restait ouvert deux heures, et le bouton
// de déconnexion ne faisait qu'effacer le cookie du navigateur. Le jeton porte
// désormais l'identifiant de sa session, et cette table dit si elle vit encore.

// Fonction pour ouvrir une session
const create = async (id_session, users_id, ip, user_agent, expires_at) => {
  const sql = `INSERT INTO user_session (id_session, users_id, ip, user_agent, expires_at, last_seen_at)
               VALUES (?,?,?,?,?,NOW())`;
  const [result] = await db.execute(sql, [id_session, users_id, ip, user_agent, expires_at]);
  return result;
};

// Fonction pour vérifier qu'une session est toujours valable.
// La requête filtre elle-même sur la révocation et l'expiration : l'appelant n'a
// pas à y penser, et ne peut donc pas oublier de le faire.
const findActive = async (id_session) => {
  const sql = `SELECT id_session, users_id
                 FROM user_session
                WHERE id_session = ?
                  AND revoked_at IS NULL
                  AND expires_at > NOW()`;
  const [result] = await db.execute(sql, [id_session]);
  return result[0];
};

// Fonction pour noter le dernier passage.
//
// La condition sur last_seen_at évite une écriture à chaque requête : la colonne
// n'est mise à jour que si plus de cinq minutes se sont écoulées. Sans elle,
// afficher une page déclencherait une dizaine d'écritures, pour une information
// qui n'a pas besoin d'être à la seconde près.
const toucher = async (id_session) => {
  const sql = `UPDATE user_session
                  SET last_seen_at = NOW()
                WHERE id_session = ?
                  AND (last_seen_at IS NULL OR last_seen_at < (NOW() - INTERVAL 5 MINUTE))`;
  const [result] = await db.execute(sql, [id_session]);
  return result;
};

// Fonction pour révoquer une session précise
const revoquer = async (id_session, revoked_by = null) => {
  const sql = `UPDATE user_session
                  SET revoked_at = NOW(), revoked_by = ?
                WHERE id_session = ? AND revoked_at IS NULL`;
  const [result] = await db.execute(sql, [revoked_by, id_session]);
  return result;
};

// Fonction pour révoquer toutes les sessions d'un utilisateur.
// Utilisée par l'administration, et après un changement de mot de passe : sans
// cela, la personne qui aurait pris la main sur le compte y resterait connectée.
const revoquerTout = async (users_id, revoked_by = null, sauf = null) => {
  const sql = `UPDATE user_session
                  SET revoked_at = NOW(), revoked_by = ?
                WHERE users_id = ?
                  AND revoked_at IS NULL
                  AND (? IS NULL OR id_session <> ?)`;
  const [result] = await db.execute(sql, [revoked_by, users_id, sauf, sauf]);
  return result;
};

// Fonction pour lister les sessions, pour le panel d'administration.
// Les sessions révoquées ou expirées depuis peu restent visibles : c'est ce qui
// permet de constater qu'une révocation a bien eu lieu.
const lister = async () => {
  const sql = `SELECT s.id_session, s.users_id, s.ip, s.user_agent,
                      s.created_at, s.last_seen_at, s.expires_at, s.revoked_at,
                      u.username, u.email, u.avatar, u.role,
                      r.username AS revoque_par
                 FROM user_session s
                 JOIN users u ON u.id = s.users_id
                 LEFT JOIN users r ON r.id = s.revoked_by
                WHERE s.expires_at > (NOW() - INTERVAL 7 DAY)
                ORDER BY (s.revoked_at IS NULL AND s.expires_at > NOW()) DESC,
                         s.last_seen_at DESC`;
  const [result] = await db.execute(sql);
  return result;
};

// Fonction pour supprimer les sessions expirées depuis plus de trente jours
const purger = async () => {
  const sql = 'DELETE FROM user_session WHERE expires_at < (NOW() - INTERVAL 30 DAY)';
  const [result] = await db.execute(sql);
  return result;
};

export default {
  create,
  findActive,
  toucher,
  revoquer,
  revoquerTout,
  lister,
  purger,
};
