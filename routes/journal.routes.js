import express from 'express';
import journalController from '../controllers/journals.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isProjectMember } from '../middleware/isProjectMember.middleware.js';
import upload from '../middleware/upload.middleware.js';
import validate from '../middleware/validate.js';
import { validateJournalBody } from '../validators/journal.validator.js';

const router = express.Router({ mergeParams: true });

// Toutes les routes de ce fichier concernent un projet précis, et sont donc
// réservées aux membres de son équipe. Le contrôle est posé une fois ici plutôt
// que répété sur chaque route : ajouter demain une route sans protection devient
// impossible par oubli. C'est exactement ainsi que la faille relevée aux audits
// était née, être connecté suffisant alors à lire le projet de n'importe qui.
router.use(authenticate, isProjectMember);


// Récupération de tous les messages d'un projet
router.get('/', journalController.getProjectMessage);

// Création d'un nouveau message dans le journal d'un projet
router.post('/', validateJournalBody, validate, journalController.createMessage);

// Modification d'un message existant dans le journal d'un projet (uniquement l'auteur)
router.put('/:id_journal', validateJournalBody, validate, journalController.updateMessage);

// Suppression d'un message existant dans le journal d'un projet (l'auteur ou le owner)
router.delete('/:id_journal', journalController.deleteMessage);

// Envoi d'une image à insérer dans le corps d'un message.
// Elle n'est pas enregistrée en base : seule son adresse revient au navigateur, qui la
// place dans le texte. C'est le message qui la porte ensuite.
router.post('/image', upload.single('file'), journalController.uploadImage);

export default router;