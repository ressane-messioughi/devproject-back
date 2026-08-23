import express from 'express';
import teamController from "../controllers/team.controller.js"
import { authenticate } from '../middleware/auth.middleware.js';
import { isProjectOwner } from '../middleware/isProjectOwner.middleware.js';
import validate from '../middleware/validate.js';
import { validateTeamRoleBody } from '../validators/team.validator.js';

const router = express.Router({ mergeParams: true });

// Récupération de toutes les membres de l'équipe du projet selectionné
router.get('/', authenticate, teamController.getUserTeam );

// Suppression d'un utilisateur dans une équipe (projet)
router.delete("/:team_id", authenticate, teamController.deleteTeamUser)

// Modification du team_role d'un membre (uniquement par le owner)
router.patch("/:users_id/role", authenticate, isProjectOwner, validateTeamRoleBody, validate, teamController.updateTeamRole)

// Retrait d'un membre de l'équipe par le owner (à ne pas confondre avec /:team_id qui gère le départ volontaire)
router.delete("/:users_id/member", authenticate, isProjectOwner, teamController.removeMember)

export default router;
