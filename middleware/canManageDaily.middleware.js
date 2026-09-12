import teamModel from '../models/team.model.js';
import AppError from './AppError.js';

// Middleware qui autorise la gestion du point quotidien.
//
// Deux personnes peuvent le piloter : le propriétaire du projet, et celle qui porte le
// rôle Scrum dans l'équipe. C'est exactement la répartition d'une équipe agile — animer
// le point quotidien fait partie du rôle Scrum, pas de la propriété du projet.
//
// À la différence de isProjectOwner, ce contrôle regarde donc aussi team_role.
export const canManageDaily = async (req, res, next) => {
  try {
    const { id_project } = req.params;

    const team = await teamModel.findByProjectId(id_project);
    if (!team) {
      throw new AppError('Équipe introuvable pour ce projet', 404);
    }

    const userRole = await teamModel.getUserRole(req.user.id, team.id_team);
    if (!userRole) {
      throw new AppError('Vous ne faites pas partie de ce projet', 403);
    }

    if (userRole.role !== 'OWNER' && userRole.team_role !== 'Scrum') {
      throw new AppError(
        'Seuls le propriétaire du projet et le Scrum peuvent gérer le point quotidien',
        403,
      );
    }

    req.team = team;
    next();
  } catch (error) {
    next(error);
  }
};
