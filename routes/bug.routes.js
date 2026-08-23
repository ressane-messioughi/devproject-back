import express from 'express';

import bugController from '../controllers/bug.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isProjectOwner } from '../middleware/isProjectOwner.middleware.js';
import upload from '../middleware/upload.middleware.js';
import validate from '../middleware/validate.js';
import { validateBugBody } from '../validators/bug.validator.js';

const router = express.Router({ mergeParams: true });

// Récupération de tous les bugs d'un projet
router.get('/', authenticate, bugController.getBugByProject);

// Création d'un nouveau bug pour un projet (avec capture d'écran obligatoire)
// upload doit passer avant validate : multer est ce qui remplit req.body pour une requête multipart
router.post('/', authenticate, upload.single('file'), validateBugBody, validate, bugController.createBug);

// Mise à jour d'un bug existant (uniquement l'auteur, vérifié dans bugs.service.js)
router.put('/:id_bug', authenticate, validateBugBody, validate, bugController.updateBug);

// Changement du statut d'un bug (ouvert à tous les membres de l'équipe)
router.patch('/:id_bug/status', authenticate, bugController.updateBugStatus);

// Suppression d'un bug (uniquement le owner du projet)
router.delete('/:id_bug', authenticate, isProjectOwner, bugController.deleteBug);

export default router;
