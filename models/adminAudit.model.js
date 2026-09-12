import db from '../config/db.js';

// Journal d'audit des actions d'administration.
//
// Le panel peut tout voir et tout supprimer. Sans trace, rien ne distingue une
// suppression légitime d'une autre, et personne ne peut rendre de comptes.

// Fonction pour enregistrer une action
const create = async ({
  admin_id,
  admin_username,
  action,
  cible_type = null,
  cible_id = null,
  details = null,
  ip = null,
}) => {
  const sql = `INSERT INTO admin_audit
                 (admin_id, admin_username, action, cible_type, cible_id, details, ip)
               VALUES (?,?,?,?,?,?,?)`;
  const [result] = await db.execute(sql, [
    admin_id,
    admin_username,
    action,
    cible_type,
    cible_id,
    // La colonne fait 500 caractères : une valeur plus longue ferait échouer
    // l'écriture, et donc perdre la trace, ce qui est le contraire du but.
    details ? String(details).slice(0, 500) : null,
    ip,
  ]);
  return result;
};

// Fonction pour lire le journal, du plus récent au plus ancien.
// La limite évite qu'un panel ouvert depuis longtemps ne rapatrie des dizaines
// de milliers de lignes d'un coup.
const lister = async (limite = 300) => {
  const sql = `SELECT id_audit, admin_id, admin_username, action, cible_type,
                      cible_id, details, ip, created_at
                 FROM admin_audit
                ORDER BY created_at DESC, id_audit DESC
                LIMIT ?`;
  // LIMIT n'accepte pas de paramètre préparé sur toutes les versions : la valeur
  // est donc convertie en entier ici, ce qui interdit toute injection.
  const [result] = await db.query(sql, [Number.parseInt(limite, 10) || 300]);
  return result;
};

export default { create, lister };
