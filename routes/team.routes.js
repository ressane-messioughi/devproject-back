import express from 'express';
import teamController from "../controllers/team.controller.js"
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true });

// Récupération de toutes les membres de l'équipe du projet selectionné 
router.get('/', authenticate, teamController.getUserTeam );

// Suppression d'un utilisateur dans une équipe (projet)
router.delete("/:team_id", authenticate, teamController.deleteTeamUser)

export default router;
