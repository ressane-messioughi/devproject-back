// Gabarit commun à tous les emails de DevProject.
//
// Un email n'est pas une page web : la moitié des clients de messagerie ignorent
// les feuilles de styles, ne connaissent ni flexbox ni grid, et Outlook rend
// encore le HTML avec le moteur de Word. Trois conséquences, suivies partout ici :
//
//   1. la mise en page passe par des <table> imbriquées, pas par des <div> ;
//   2. chaque style est écrit en attribut style= sur la balise concernée ;
//   3. aucune image n'est indispensable à la compréhension, car beaucoup de
//      clients les bloquent tant que le destinataire ne les autorise pas. Le nom
//      DevProject est donc écrit en texte sous le logo, et non dessiné dedans.
//
// Les couleurs sont exactement celles de l'application, reprises de index.css.

const COULEURS = {
  fond: '#1a202c',
  carte: '#111827',
  bordure: '#2d3748',
  texte: '#ffffff',
  texteAttenue: '#a0aec0',
  accent: '#ffffff',
  succes: '#22c55e',
  danger: '#e22727',
};

const APP_URL = process.env.APP_URL || 'https://devproject.ressane.fr';

// Une police d'interface, pas une police téléchargée : Inter n'existe pas chez
// le destinataire et le client de messagerie ne la chargera pas.
const POLICE =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// Échappe le texte injecté dans le gabarit. Le contenu des emails de campagne
// est déjà nettoyé par sanitizeHtml ; ce qui passe ici, ce sont les prénoms, les
// sujets et les liens, qui ne doivent jamais pouvoir introduire de balise.
export const echapper = (valeur) =>
  String(valeur ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Bouton d'action. Écrit en table plutôt qu'en <a> stylé : sous Outlook, un lien
// avec du remplissage perd sa couleur de fond et redevient un lien bleu souligné.
export const bouton = (libelle, url) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px auto 8px;">
    <tr>
      <td align="center" bgcolor="${COULEURS.accent}" style="border-radius:10px;">
        <a href="${echapper(url)}"
           style="display:inline-block;padding:14px 30px;font-family:${POLICE};font-size:15px;
                  font-weight:700;color:${COULEURS.fond};text-decoration:none;border-radius:10px;">
          ${echapper(libelle)}
        </a>
      </td>
    </tr>
  </table>`;

// Bloc de repli affiché sous chaque bouton : si le client de messagerie n'ouvre
// pas le lien au clic, l'adresse reste copiable à la main.
export const lienDeSecours = (url) => `
  <p style="margin:4px 0 0;font-family:${POLICE};font-size:12px;line-height:1.6;
            color:${COULEURS.texteAttenue};text-align:center;word-break:break-all;">
    Si le bouton ne fonctionne pas, copiez cette adresse dans votre navigateur :<br>
    <span style="color:${COULEURS.texteAttenue};">${echapper(url)}</span>
  </p>`;

/**
 * Enveloppe un contenu HTML déjà prêt dans l'habillage DevProject.
 *
 * @param {object} options
 * @param {string} options.titre       Titre affiché en haut de la carte.
 * @param {string} options.corps       HTML du message, déjà échappé ou nettoyé.
 * @param {string} [options.preEntete] Phrase affichée par le client de messagerie
 *                                     à côté de l'objet, avant ouverture.
 * @param {string} [options.piedNote]  Ligne supplémentaire dans le pied de page.
 */
export function gabaritEmail({ titre, corps, preEntete = '', piedNote = '' }) {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${echapper(titre)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COULEURS.fond};">

  <!-- Pré-en-tête : lu par la boîte de réception, jamais affiché dans le message. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${echapper(preEntete)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:${COULEURS.fond};padding:32px 16px;">
    <tr>
      <td align="center">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
               style="width:100%;max-width:600px;">

          <!-- Bandeau : logo puis nom en toutes lettres, pour rester lisible
               quand les images sont bloquées. -->
          <tr>
            <td align="center" style="padding:0 0 24px;">
              <img src="${APP_URL}/logo-email.png" width="180" alt="DevProject"
                   style="display:block;width:180px;max-width:60%;height:auto;border:0;">
            </td>
          </tr>

          <!-- Carte du message -->
          <tr>
            <td style="background-color:${COULEURS.carte};border:1px solid ${COULEURS.bordure};
                       border-radius:16px;padding:0;">

              <!-- Filet dégradé, repris du haut des fenêtres de l'application -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td height="3" style="height:3px;line-height:3px;font-size:0;
                    background-color:#3b82f6;border-radius:16px 16px 0 0;">&nbsp;</td></tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:32px 32px 36px;">
                    <h1 style="margin:0 0 18px;font-family:${POLICE};font-size:22px;
                               line-height:1.3;font-weight:700;color:${COULEURS.texte};">
                      ${echapper(titre)}
                    </h1>
                    ${corps}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td align="center" style="padding:24px 12px 0;">
              <p style="margin:0 0 6px;font-family:${POLICE};font-size:12px;line-height:1.7;
                        color:${COULEURS.texteAttenue};">
                ${piedNote ? `${echapper(piedNote)}<br>` : ''}
                DevProject &middot; la gestion de projet de votre équipe, au même endroit.
              </p>
              <p style="margin:0;font-family:${POLICE};font-size:12px;line-height:1.7;
                        color:${COULEURS.texteAttenue};">
                <a href="${APP_URL}" style="color:${COULEURS.texteAttenue};text-decoration:underline;">devproject.ressane.fr</a>
                &nbsp;&middot;&nbsp;
                <a href="${APP_URL}/mentions-legales" style="color:${COULEURS.texteAttenue};text-decoration:underline;">Mentions légales</a>
                &nbsp;&middot;&nbsp;
                <a href="${APP_URL}/confidentialite" style="color:${COULEURS.texteAttenue};text-decoration:underline;">Confidentialité</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

// Paragraphe du corps, à la bonne couleur et à la bonne police.
export const paragraphe = (html) => `
  <p style="margin:0 0 16px;font-family:${POLICE};font-size:15px;line-height:1.7;
            color:${COULEURS.texteAttenue};">${html}</p>`;

// Mise en avant d'une information courte : durée de validité, avertissement.
export const encart = (html, couleur = COULEURS.succes) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="margin:20px 0 4px;">
    <tr>
      <td style="background-color:#0a0e14;border-left:3px solid ${couleur};
                 border-radius:8px;padding:14px 16px;">
        <p style="margin:0;font-family:${POLICE};font-size:13px;line-height:1.6;
                  color:${COULEURS.texteAttenue};">${html}</p>
      </td>
    </tr>
  </table>`;

export { COULEURS, POLICE, APP_URL };
