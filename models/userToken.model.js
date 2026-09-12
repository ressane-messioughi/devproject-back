import db from '../config/db.js';

// Jetons d'action sur un compte : confirmation d'adresse et réinitialisation de
// mot de passe.
//
// Ce qui est stocké ici est l'empreinte SHA-256 du jeton, jamais le jeton
// lui-même. Le service est seul à manipuler la valeur envoyée par email.

// Fonction pour enregistrer un nouveau jeton
const create = async (users_id, type, token_hash, expires_at) => {
  const sql = 'INSERT INTO user_token (users_id, type, token_hash, expires_at) VALUES (?,?,?,?)';
  const [result] = await db.execute(sql, [users_id, type, token_hash, expires_at]);
  return result;
};

// Fonction pour retrouver un jeton encore valable à partir de son empreinte.
// La requête filtre elle-même sur l'expiration et sur l'usage : un jeton périmé
// ou déjà consommé ne remonte pas, plutôt que de laisser l'appelant y penser.
const findValide = async (token_hash, type) => {
  const sql = `SELECT t.id_token, t.users_id, u.firstname, u.email, u.welcome_sent_at
                 FROM user_token t
                 JOIN users u ON u.id = t.users_id
                WHERE t.token_hash = ?
                  AND t.type = ?
                  AND t.used_at IS NULL
                  AND t.expires_at > NOW()`;
  const [result] = await db.execute(sql, [token_hash, type]);
  return result[0];
};

// Fonction pour marquer un jeton comme consommé
const marquerUtilise = async (id_token) => {
  const sql = 'UPDATE user_token SET used_at = NOW() WHERE id_token = ?';
  const [result] = await db.execute(sql, [id_token]);
  return result;
};

// Fonction pour invalider les jetons encore en attente d'un utilisateur.
// Appelée avant d'en émettre un nouveau : sans ça, un ancien lien de
// réinitialisation resterait utilisable en parallèle du dernier envoyé.
const invaliderPrecedents = async (users_id, type) => {
  const sql =
    'UPDATE user_token SET used_at = NOW() WHERE users_id = ? AND type = ? AND used_at IS NULL';
  const [result] = await db.execute(sql, [users_id, type]);
  return result;
};

// Fonction pour supprimer les jetons expirés depuis plus de sept jours.
// Rien ne les lit plus, ils n'ont pas à rester en base.
const purger = async () => {
  const sql = 'DELETE FROM user_token WHERE expires_at < (NOW() - INTERVAL 7 DAY)';
  const [result] = await db.execute(sql);
  return result;
};

export default {
  create,
  findValide,
  marquerUtilise,
  invaliderPrecedents,
  purger,
};
