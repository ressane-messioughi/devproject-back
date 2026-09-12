import express from 'express';
import journalController from '../controllers/journals.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import validate from '../middleware/validate.js';
import { validateJournalBody } from '../validators/journal.validator.js';

const router = express.Router({ mergeParams: true });

// Récupération de tous les messages d'un projet
router.get('/', authenticate, journalController.getProjectMessage);

// Création d'un nouveau message dans le journal d'un projet
router.post('/', authenticate, validateJournalBody, validate, journalController.createMessage);

// Modification d'un message existant dans le journal d'un projet (uniquement l'auteur)
router.put('/:id_journal', authenticate, validateJournalBody, validate, journalController.updateMessage);

// Suppression d'un message existant dans le journal d'un projet (l'auteur ou le owner)
router.delete('/:id_journal', authenticate, journalController.deleteMessage);

// Envoi d'une image à insérer dans le corps d'un message.
// Elle n'est pas enregistrée en base : seule son adresse revient au navigateur, qui la
// place dans le texte. C'est le message qui la porte ensuite.
router.post('/image', authenticate, upload.single('file'), journalController.uploadImage);

export default router;