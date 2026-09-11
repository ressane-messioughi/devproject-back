import express from 'express';

import schemaController from '../controllers/schema.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isProjectOwner } from '../middleware/isProjectOwner.middleware.js';
import upload from '../middleware/upload.middleware.js';
import validate from '../middleware/validate.js';
import { validateSchemaBody } from '../validators/schema.validator.js';

const router = express.Router({ mergeParams: true });

// Récupération de tous les schémas d'un projet
router.get('/', authenticate, schemaController.getProjectSchemas);

// Récupération d'un schéma par son ID
router.get('/:id_schema', authenticate, schemaController.getSchemaById);

// Création d'un nouveau schéma pour un projet (avec fichier obligatoire)
// upload doit passer avant validate : multer est ce qui remplit req.body pour une requête multipart
router.post('/', authenticate, upload.single('file'), validateSchemaBody, validate, schemaController.createSchema);

// Renommage d'un schéma existant (uniquement la personne qui l'a déposé, vérifié dans schema.service.js)
router.put('/:id_schema', authenticate, validateSchemaBody, validate, schemaController.updateSchema);

// Suppression d'un schéma existant (uniquement le owner du projet)
router.delete('/:id_schema', authenticate, isProjectOwner, schemaController.deleteSchema);

export default router;
