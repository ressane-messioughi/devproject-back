import express from 'express';
import teamController from "../controllers/team.controller.js"
import { authenticate } from '../middleware/auth.middleware.js';
import { isProjectMember } from '../middleware/isProjectMember.middleware.js';
import { isProjectOwner } from '../middleware/isProjectOwner.middleware.js';
import validate from '../middleware/validate.js';
import { validateTeamRoleBody } from '../validators/team.validator.js';

const router = express.Router({ mergeParams: true });

// Toutes les routes de ce fichier concernent un projet précis, et sont donc
// réservées aux membres de son équipe. Le contrôle est posé une fois ici plutôt
// que répété sur chaque route : ajouter demain une route sans protection devient
// impossible par oubli. C'est exactement ainsi que la faille relevée aux audits
// était née, être connecté suffisant alors à lire le projet de n'importe qui.
router.use(authenticate, isProjectMember);


// Récupération de toutes les membres de l'équipe du projet selectionné
router.get('/', teamController.getUserTeam );

// Suppression d'un utilisateur dans une équipe (projet)
router.delete("/:team_id", teamController.deleteTeamUser)

// Modification du team_role d'un membre (uniquement par le owner)
router.patch("/:users_id/role", isProjectOwner, validateTeamRoleBody, validate, teamController.updateTeamRole)

// Retrait d'un membre de l'équipe par le owner (à ne pas confondre avec /:team_id qui gère le départ volontaire)
router.delete("/:users_id/member", isProjectOwner, teamController.removeMember)

export default router;
