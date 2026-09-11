import express from 'express';

import documentController from '../controllers/document.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import validate from '../middleware/validate.js';
import { validateDocumentBody } from '../validators/document.validator.js';

const router = express.Router({ mergeParams: true });

// Récupération de tous les documents d'un projet
router.get('/', authenticate, documentController.getProjectDocuments);

// Dépôt d'un nouveau document (fichier obligatoire)
// upload doit passer avant validate : multer est ce qui remplit req.body pour une requête multipart
router.post('/', authenticate, upload.single('file'), validateDocumentBody, validate, documentController.createDocument);

// Renommage d'un document (uniquement la personne qui l'a déposé, vérifié dans document.service.js)
router.put('/:id_document', authenticate, validateDocumentBody, validate, documentController.updateDocument);

// Suppression d'un document (son auteur, ou le owner du projet — vérifié dans le contrôleur)
router.delete('/:id_document', authenticate, documentController.deleteDocument);

export default router;
