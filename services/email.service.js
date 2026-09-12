import nodemailer from 'nodemailer';

// Envoi des emails du projet.
//
// Le transport est choisi au premier envoi, pas au démarrage : sans cela, lancer
// le serveur sans identifiants SMTP ferait échouer le démarrage entier alors que
// la quasi-totalité de l'application n'a pas besoin d'envoyer d'email.
//
// Sans SMTP configuré, les messages ne partent pas : ils sont écrits dans la
// console. C'est voulu. Le développement reste possible sans compte d'envoi, et
// le lien de confirmation ou de réinitialisation est lisible dans le terminal.

let transport = null;
let modeConsole = false;

const estConfigure = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

function obtenirTransport() {
  if (transport) return transport;

  if (!estConfigure()) {
    modeConsole = true;
    // jsonTransport ne contacte aucun serveur : il rend le message sérialisé.
    transport = nodemailer.createTransport({ jsonTransport: true });
    return transport;
  }

  const port = Number(process.env.SMTP_PORT) || 587;

  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 est le port du SMTP chiffré de bout en bout. Sur 587, la connexion
    // démarre en clair puis passe en TLS avec STARTTLS : secure doit alors
    // rester à false, sinon la poignée de main échoue.
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  return transport;
}

// Adresse affichée comme expéditeur. Le nom lisible compte autant que l'adresse :
// une boîte de réception affiche « DevProject » et non une suite de caractères.
const expediteur = () =>
  process.env.SMTP_FROM || '"DevProject" <no-reply@devproject.ressane.fr>';

// Version texte du message, construite à partir du HTML.
//
// Un email sans partie texte part beaucoup plus souvent en indésirable, et reste
// illisible pour qui lit son courrier en texte seul. Plutôt que de rédiger deux
// fois chaque message, on dérive le texte du HTML : les liens sont conservés
// entre parenthèses, car ils disparaîtraient sinon complètement.
export function htmlVersTexte(html) {
  return String(html)
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|h1|h2|h3|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '.')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Envoie un message.
 *
 * Ne lève jamais : un email qui ne part pas ne doit pas faire échouer
 * l'inscription ou la réinitialisation qui l'a déclenché. L'appelant reçoit le
 * résultat et décide quoi en faire.
 *
 * @returns {Promise<{envoye: boolean, erreur?: string}>}
 */
export async function envoyerEmail({ destinataire, sujet, html }) {
  try {
    const envoyeur = obtenirTransport();

    const resultat = await envoyeur.sendMail({
      from: expediteur(),
      to: destinataire,
      subject: sujet,
      html,
      text: htmlVersTexte(html),
    });

    if (modeConsole) {
      console.info(
        `[email] SMTP non configuré : message non envoyé.\n` +
          `        Destinataire : ${destinataire}\n` +
          `        Objet        : ${sujet}\n` +
          `        Texte        :\n${htmlVersTexte(html)}\n`,
      );
      return { envoye: false, erreur: 'SMTP non configuré' };
    }

    console.info(`[email] envoyé à ${destinataire} - ${resultat.messageId}`);
    return { envoye: true };
  } catch (error) {
    console.error(`[email] échec vers ${destinataire} : ${error.message}`);
    return { envoye: false, erreur: error.message };
  }
}

/**
 * Envoie le même message à une liste de destinataires, par petits paquets.
 *
 * Un fournisseur SMTP coupe la connexion quand on lui ouvre cinq cents envois
 * simultanés, et compte cela comme un comportement d'expéditeur de masse. Les
 * envois partent donc par lots, avec une pause entre chaque.
 *
 * Chaque destinataire reçoit un message séparé : mettre toute la liste en copie
 * révélerait les adresses de tous les inscrits à chacun d'eux.
 */
export async function envoyerParLots({ destinataires, sujet, html, taillePaquet = 20, pauseMs = 1000 }) {
  let envoyes = 0;
  const echecs = [];

  for (let debut = 0; debut < destinataires.length; debut += taillePaquet) {
    const paquet = destinataires.slice(debut, debut + taillePaquet);

    const resultats = await Promise.all(
      paquet.map((destinataire) => envoyerEmail({ destinataire, sujet, html })),
    );

    resultats.forEach((resultat, index) => {
      if (resultat.envoye) envoyes += 1;
      else echecs.push({ destinataire: paquet[index], erreur: resultat.erreur });
    });

    const resteDesPaquets = debut + taillePaquet < destinataires.length;
    if (resteDesPaquets && pauseMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, pauseMs));
    }
  }

  return { envoyes, echecs };
}

// Exposé pour les tests et pour la page d'état du panel d'administration.
export const smtpEstConfigure = estConfigure;
