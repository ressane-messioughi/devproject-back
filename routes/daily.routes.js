import express from 'express';

import dailyController from '../controllers/daily.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isProjectMember } from '../middleware/isProjectMember.middleware.js';
import { canManageDaily } from '../middleware/canManageDaily.middleware.js';
import validate from '../middleware/validate.js';
import { validateDailyBody } from '../validators/daily.validator.js';

const router = express.Router({ mergeParams: true });

// Toutes les routes de ce fichier concernent un projet précis, et sont donc
// réservées aux membres de son équipe. Le contrôle est posé une fois ici plutôt
// que répété sur chaque route : ajouter demain une route sans protection devient
// impossible par oubli. C'est exactement ainsi que la faille relevée aux audits
// était née, être connecté suffisant alors à lire le projet de n'importe qui.
router.use(authenticate, isProjectMember);


// Lecture ouverte à toute l'équipe : chacun doit savoir quand et où a lieu le point
router.get('/', dailyController.getCurrent);

// La gestion revient au propriétaire du projet et à la personne qui porte le rôle Scrum
router.post('/', canManageDaily, validateDailyBody, validate, dailyController.create);
router.put('/:id_daily', canManageDaily, validateDailyBody, validate, dailyController.update);
router.patch('/:id_daily/start', canManageDaily, dailyController.start);
router.patch('/:id_daily/end', canManageDaily, dailyController.end);
router.delete('/:id_daily', canManageDaily, dailyController.remove);

export default router;
