import teamModel from '../models/team.model.js';
import AppError from './AppError.js';

// Middleware qui vérifie que l'utilisateur connecté fait bien partie de l'équipe
// du projet ciblé (req.params.id_project).
//
// Jusqu'ici, seules les salles WebSocket contrôlaient cet accès. Côté HTTP, être
// connecté suffisait : n'importe quel compte pouvait lire le journal, les bugs,
// les sprints ou les documents de n'importe quel projet en changeant un numéro
// dans l'adresse. Les audits l'avaient relevé, ce middleware le ferme.
//
// Il est posé une seule fois en tête de chaque routeur de projet, et non route
// par route : ajouter demain une route sans protection devient impossible par
// oubli, ce qui est exactement la manière dont la faille était née.

export const isProjectMember = async (req, res, next) => {
  try {
    const { id_project } = req.params;

    if (!id_project) {
      throw new AppError('Projet non précisé', 400);
    }

    const team = await teamModel.findByProjectId(id_project);

    // Un projet inexistant et un projet dont on ne fait pas partie renvoient
    // volontairement la même réponse. Distinguer les deux permettrait de
    // découvrir quels projets existent en parcourant les numéros, et donc de
    // mesurer l'activité du site sans y avoir accès.
    if (!team) {
      throw new AppError("Projet introuvable ou vous n'y avez pas accès", 404);
    }

    const appartenance = await teamModel.getUserRole(req.user.id, team.id_team);

    if (!appartenance) {
      throw new AppError("Projet introuvable ou vous n'y avez pas accès", 404);
    }

    // Rangés sur la requête pour la suite de la chaîne : isProjectOwner et
    // canManageDaily s'en servent au lieu de réinterroger la base.
    req.team = team;
    req.membership = appartenance;

    next();
  } catch (error) {
    next(error);
  }
};
