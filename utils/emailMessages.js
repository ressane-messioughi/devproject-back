import {
  gabaritEmail,
  paragraphe,
  bouton,
  encart,
  lienDeSecours,
  echapper,
  COULEURS,
  POLICE,
  APP_URL,
} from './emailTemplate.js';

// Les trois messages automatiques de DevProject, plus l'habillage des campagnes
// envoyées depuis le panel d'administration.
//
// Chaque message est construit ici et nulle part ailleurs : le jour où le ton ou
// la signature changent, il n'y a qu'un fichier à relire.

// Durées reprises telles quelles dans le texte des messages, pour qu'elles ne
// puissent pas se désynchroniser de ce que le serveur applique réellement.
export const DUREE_CONFIRMATION_HEURES = 48;
export const DUREE_REINITIALISATION_MINUTES = 30;

/** Confirmation de l'adresse, envoyée juste après l'inscription. */
export function messageConfirmation({ prenom, url }) {
  return {
    sujet: "Confirmez votre adresse - DevProject",
    html: gabaritEmail({
      titre: "Il ne reste qu'une étape",
      preEntete: "Confirmez votre adresse pour activer votre compte DevProject.",
      corps: `
        ${paragraphe(`Bonjour ${echapper(prenom)},`)}
        ${paragraphe(
          "Votre compte DevProject est créé. Pour l'activer, confirmez que cette adresse est bien la vôtre.",
        )}
        ${bouton('Confirmer mon adresse', url)}
        ${lienDeSecours(url)}
        ${encart(
          `Ce lien est valable <strong style="color:${COULEURS.texte};">${DUREE_CONFIRMATION_HEURES} heures</strong>. Passé ce délai, une nouvelle demande depuis l'écran de connexion vous en enverra un autre.`,
        )}
        ${paragraphe(
          `<span style="font-size:13px;">Si vous n'êtes pas à l'origine de cette inscription, ignorez ce message : sans confirmation, le compte reste inactif.</span>`,
        )}`,
      piedNote: "Message automatique, envoyé suite à une inscription.",
    }),
  };
}

/** Réinitialisation du mot de passe. */
export function messageReinitialisation({ prenom, url }) {
  return {
    sujet: "Réinitialisation de votre mot de passe - DevProject",
    html: gabaritEmail({
      titre: "Réinitialiser votre mot de passe",
      preEntete: "Un lien pour choisir un nouveau mot de passe DevProject.",
      corps: `
        ${paragraphe(`Bonjour ${echapper(prenom)},`)}
        ${paragraphe(
          "Une demande de réinitialisation a été faite pour votre compte. Choisissez un nouveau mot de passe avec le bouton ci-dessous.",
        )}
        ${bouton('Choisir un nouveau mot de passe', url)}
        ${lienDeSecours(url)}
        ${encart(
          `Ce lien est valable <strong style="color:${COULEURS.texte};">${DUREE_REINITIALISATION_MINUTES} minutes</strong> et ne fonctionne qu'une seule fois.`,
          COULEURS.succes,
        )}
        ${encart(
          "Vous n'avez rien demandé ? Ne cliquez pas, et surtout ne transmettez ce lien à personne. Votre mot de passe actuel reste valable tant que ce lien n'a pas été utilisé.",
          COULEURS.danger,
        )}`,
      piedNote: "Message automatique, envoyé suite à une demande de réinitialisation.",
    }),
  };
}

// Les trois pistes proposées dans le message de bienvenue.
const DEMARRAGE = [
  [
    'Créez votre projet',
    "Vous en devenez le propriétaire et recevez un code d'équipe à partager.",
  ],
  ['Ou rejoignez-en un', "Avec le code que votre équipe vous a transmis."],
  [
    'Publiez votre première note',
    'Le journal de bord garde la trace de ce que chacun a fait, et à quel moment.',
  ],
];

/** Bienvenue, envoyé une seule fois, après la confirmation de l'adresse. */
export function messageBienvenue({ prenom }) {
  const pistes = DEMARRAGE.map(
    ([titre, texte]) => `
          <tr>
            <td style="padding:0 0 12px;">
              <p style="margin:0;font-family:${POLICE};font-size:14px;font-weight:700;
                        color:${COULEURS.texte};">${titre}</p>
              <p style="margin:2px 0 0;font-family:${POLICE};font-size:13px;line-height:1.6;
                        color:${COULEURS.texteAttenue};">${texte}</p>
            </td>
          </tr>`,
  ).join('');

  return {
    sujet: "Bienvenue sur DevProject",
    html: gabaritEmail({
      titre: "Bienvenue sur DevProject",
      preEntete: "Votre compte est actif. Voici par où commencer.",
      corps: `
        ${paragraphe(`Bonjour ${echapper(prenom)},`)}
        ${paragraphe(
          "Votre adresse est confirmée et votre compte est actif. DevProject rassemble le journal de bord, le suivi des bugs, les sprints, les schémas et les documents de votre équipe autour d'un seul projet.",
        )}
        ${paragraphe('Trois façons de démarrer :')}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="margin:0 0 8px;">${pistes}</table>
        ${bouton('Ouvrir DevProject', `${APP_URL}/login`)}`,
      piedNote: "Message envoyé une seule fois, à l'activation du compte.",
    }),
  };
}

/**
 * Habillage d'une campagne écrite depuis le panel d'administration.
 *
 * Le contenu arrive de l'éditeur de texte riche et a déjà traversé le nettoyage
 * anti-XSS du serveur : il est inséré tel quel, sans être échappé une seconde
 * fois, sinon les balises de mise en forme s'afficheraient en toutes lettres.
 */
export function messageCampagne({ sujet, contenuHtml }) {
  return {
    sujet,
    html: gabaritEmail({
      titre: sujet,
      preEntete: sujet,
      corps: `
        <div class="contenu-email" style="font-family:${POLICE};font-size:15px;
                    line-height:1.7;color:${COULEURS.texteAttenue};">
          ${contenuHtml}
        </div>`,
      piedNote: "Vous recevez ce message en tant qu'inscrit sur DevProject.",
    }),
  };
}
