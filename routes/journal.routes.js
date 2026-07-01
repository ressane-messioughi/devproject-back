import express from 'express';
import journalController from '../controllers/journals.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true });

// Récupération de tous les messages d'un projet
router.get('/', authenticate, journalController.getProjectMessage);

// Création d'un nouveau message dans le journal d'un projet
router.post('/', authenticate, journalController.createMessage); 

// Suppression d'un message existant dans le journal d'un projet
router.delete('/:id_journal', authenticate, journalController.deleteMessage);

export default router;
