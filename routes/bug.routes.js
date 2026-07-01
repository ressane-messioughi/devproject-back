import express from 'express';

import bugController from '../controllers/bug.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true });

// Récupération de tous les bugs d'un projet
router.get('/', authenticate, bugController.getBugByProject);

// Création d'un nouveau bug pour un projet
router.post('/', authenticate, bugController.createBug);

// Mise à jour d'un bug existant pour un projet
router.put('/:id_bug', authenticate, bugController.updateBug);

// Suppression d'un bug existant pour un projet
router.delete('/:id_bug', authenticate, bugController.deleteBug);

export default router;
