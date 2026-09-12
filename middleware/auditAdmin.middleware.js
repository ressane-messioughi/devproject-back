import auditModel from '../models/adminAudit.model.js';

// Journal d'audit des actions d'administration.
//
// Le choix important est ici : la trace n'est pas écrite par chaque contrôleur,
// mais par ce middleware posé une seule fois sur le routeur d'administration.
//
// Appeler une fonction « tracer » depuis chaque contrôleur aurait marché, à
// condition de ne jamais l'oublier. Or c'est exactement le genre d'oubli qui ne
// se voit pas : l'action fonctionne, rien ne casse, et la trace manque. Poser le
// contrôle sur le routeur inverse le rapport : une action nouvelle est tracée
// par défaut, et il faudrait un geste délibéré pour qu'elle ne le soit pas.
//
// Seules les requêtes qui modifient quelque chose sont enregistrées : consulter
// une liste n'est pas une action, et noyer le journal sous les lectures le
// rendrait illisible.

// Nom lisible donné à chaque action, à partir de la méthode et du chemin.
// La clé est le chemin tel qu'Express l'a reconnu, avec ses paramètres : c'est
// stable, là où le chemin réel contient des identifiants qui changent.
const ACTIONS = {
  'DELETE /sessions/:id_session': ['SESSION_FERMEE', 'session'],
  'DELETE /users/:id_user/sessions': ['SESSIONS_COMPTE_FERMEES', 'utilisateur'],
  'PUT /tickets/:id_ticket': ['TICKET_REPONDU', 'ticket'],
  'DELETE /tickets/:id_ticket': ['TICKET_SUPPRIME', 'ticket'],
  'POST /emails': ['CAMPAGNE_ENVOYEE', 'campagne'],
  'POST /emails/image': ['IMAGE_CAMPAGNE_ENVOYEE', 'image'],
};

export const auditAdmin = (req, res, next) => {
  // La lecture ne modifie rien : il n'y a rien à tracer.
  if (req.method === 'GET') return next();

  // L'écriture a lieu à la fin de la réponse, et non avant l'action.
  //
  // C'est ce qui permet de ne consigner que ce qui a réellement abouti : une
  // suppression refusée en 403, ou qui échoue en 500, ne doit pas laisser dans
  // le journal la trace d'une action qui n'a pas eu lieu.
  res.on('finish', () => {
    if (res.statusCode >= 400) return;

    // req.route n'existe que si une route a effectivement répondu.
    const motif = req.route?.path ?? req.path;
    const cle = `${req.method} ${motif}`;
    const [action, cible_type] = ACTIONS[cle] ?? [cle, null];

    // Le premier paramètre de l'adresse désigne presque toujours la cible.
    const cible_id = Object.values(req.params ?? {})[0] ?? null;

    auditModel
      .create({
        admin_id: req.user?.id ?? null,
        // Le pseudo est recopié dans la ligne : si le compte est supprimé plus
        // tard, la trace reste lisible. C'est aussi pour cela que la clé
        // étrangère est en ON DELETE SET NULL et non en CASCADE.
        admin_username: req.user?.username ?? null,
        action,
        cible_type,
        cible_id: cible_id ? String(cible_id) : null,
        // Le contrôleur peut préciser ce qui s'est passé en renseignant
        // req.auditDetails. Rien n'y oblige : sans cela, l'action seule est
        // déjà consignée.
        details: req.auditDetails ?? null,
        ip: req.ip ?? null,
      })
      // Un journal d'audit qui tombe ne doit pas faire tomber l'API : la
      // réponse est déjà partie de toute façon. L'échec est écrit dans la
      // sortie du serveur, où il sera vu.
      .catch((error) => {
        console.error(`[audit] écriture impossible : ${error.message}`);
      });
  });

  next();
};
