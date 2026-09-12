import teamModel from '../models/team.model.js';
import AppError from './AppError.js';

// Middleware qui vérifie que l'utilisateur connecté est bien le OWNER de l'équipe
// du projet ciblé (req.params.id_project). À utiliser sur toute route réservée au owner.
export const isProjectOwner = async (req, res, next) => {
  try {
    const { id_project } = req.params;
    const user_id = req.user.id;

    // isProjectMember passe avant sur tous les routeurs de projet et a déjà
    // chargé l'équipe et l'appartenance. Les relire évite deux requêtes SQL
    // identiques sur chaque action réservée au propriétaire.
    const team = req.team ?? (await teamModel.findByProjectId(id_project));
    if (!team) {
      throw new AppError('Équipe introuvable pour ce projet', 404);
    }

    const userRole = req.membership ?? (await teamModel.getUserRole(user_id, team.id_team));
    if (!userRole || userRole.role !== 'OWNER') {
      throw new AppError('Seul le propriétaire du projet peut effectuer cette action', 403);
    }

    req.team = team;
    next();
  } catch (error) {
    next(error);
  }
};
