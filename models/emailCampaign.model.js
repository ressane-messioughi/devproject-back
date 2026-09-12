import db from '../config/db.js';

// Campagnes d'emails envoyées depuis le panel d'administration.

// Les publics possibles, et la condition SQL correspondante.
//
// La liste est fermée et le filtre n'est jamais construit à partir de ce que
// l'appelant envoie : seule la clé voyage, la condition reste écrite ici.
const PUBLICS = {
  TOUS: '1 = 1',
  CONFIRMES: 'email_verified_at IS NOT NULL',
  NON_CONFIRMES: 'email_verified_at IS NULL',
  ADMINS: "role = 'ADMIN'",
};

export const PUBLICS_VALIDES = Object.keys(PUBLICS);

// Fonction pour compter les destinataires d'un public, sans rien envoyer.
// Sert à l'aperçu du panel : on doit savoir à combien de personnes on écrit
// avant de cliquer, pas après.
const compterDestinataires = async (destinataires) => {
  const condition = PUBLICS[destinataires];
  if (!condition) return 0;

  const [result] = await db.execute(`SELECT COUNT(*) AS total FROM users WHERE ${condition}`);
  return result[0].total;
};

// Fonction pour lister les adresses d'un public
const listerDestinataires = async (destinataires) => {
  const condition = PUBLICS[destinataires];
  if (!condition) return [];

  const [result] = await db.execute(`SELECT email FROM users WHERE ${condition}`);
  return result.map((ligne) => ligne.email);
};

// Fonction pour enregistrer une campagne.
// Le contenu est conservé tel qu'il a été envoyé : c'est la seule façon de
// savoir, plus tard, ce qu'un utilisateur a réellement reçu.
const create = async ({ admin_id, sujet, contenu, destinataires, nb_envoyes, nb_echecs }) => {
  const sql = `INSERT INTO email_campaign
                 (admin_id, sujet, contenu, destinataires, nb_envoyes, nb_echecs)
               VALUES (?,?,?,?,?,?)`;
  const [result] = await db.execute(sql, [
    admin_id,
    sujet,
    contenu,
    destinataires,
    nb_envoyes,
    nb_echecs,
  ]);
  return result;
};

// Fonction pour lister les campagnes passées
const lister = async () => {
  const sql = `SELECT c.id_campaign, c.sujet, c.contenu, c.destinataires,
                      c.nb_envoyes, c.nb_echecs, c.created_at,
                      u.username AS envoyee_par
                 FROM email_campaign c
                 LEFT JOIN users u ON u.id = c.admin_id
                ORDER BY c.created_at DESC
                LIMIT 50`;
  const [result] = await db.execute(sql);
  return result;
};

export default { compterDestinataires, listerDestinataires, create, lister };
