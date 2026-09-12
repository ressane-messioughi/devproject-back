import express from 'express';

import documentController from '../controllers/document.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isProjectMember } from '../middleware/isProjectMember.middleware.js';
import upload from '../middleware/upload.middleware.js';
import validate from '../middleware/validate.js';
import { validateDocumentBody } from '../validators/document.validator.js';

const router = express.Router({ mergeParams: true });

// Toutes les routes de ce fichier concernent un projet précis, et sont donc
// réservées aux membres de son équipe. Le contrôle est posé une fois ici plutôt
// que répété sur chaque route : ajouter demain une route sans protection devient
// impossible par oubli. C'est exactement ainsi que la faille relevée aux audits
// était née, être connecté suffisant alors à lire le projet de n'importe qui.
router.use(authenticate, isProjectMember);


// Récupération de tous les documents d'un projet
router.get('/', documentController.getProjectDocuments);

// Dépôt d'un nouveau document (fichier obligatoire)
// upload doit passer avant validate : multer est ce qui remplit req.body pour une requête multipart
router.post('/', upload.single('file'), validateDocumentBody, validate, documentController.createDocument);

// Renommage d'un document (uniquement la personne qui l'a déposé, vérifié dans document.service.js)
router.put('/:id_document', validateDocumentBody, validate, documentController.updateDocument);

// Suppression d'un document (son auteur, ou le owner du projet — vérifié dans le contrôleur)
router.delete('/:id_document', documentController.deleteDocument);

export default router;
