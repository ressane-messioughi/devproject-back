import express from 'express';
import teamController from "../controllers/team.controller.js"
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true });

router.get('/', authenticate, teamController.getUserTeam );

export default router;
