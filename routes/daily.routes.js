import express from 'express';

import dailyController from '../controllers/daily.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { canManageDaily } from '../middleware/canManageDaily.middleware.js';
import validate from '../middleware/validate.js';
import { validateDailyBody } from '../validators/daily.validator.js';

const router = express.Router({ mergeParams: true });

// Lecture ouverte à toute l'équipe : chacun doit savoir quand et où a lieu le point
router.get('/', authenticate, dailyController.getCurrent);

// La gestion revient au propriétaire du projet et à la personne qui porte le rôle Scrum
router.post('/', authenticate, canManageDaily, validateDailyBody, validate, dailyController.create);
router.put('/:id_daily', authenticate, canManageDaily, validateDailyBody, validate, dailyController.update);
router.patch('/:id_daily/start', authenticate, canManageDaily, dailyController.start);
router.patch('/:id_daily/end', authenticate, canManageDaily, dailyController.end);
router.delete('/:id_daily', authenticate, canManageDaily, dailyController.remove);

export default router;
