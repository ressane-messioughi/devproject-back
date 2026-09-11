import express from 'express';

import schemaController from '../controllers/schema.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isProjectOwner } from '../middleware/isProjectOwner.middleware.js';
import upload from '../middleware/upload.middleware.js';
import validate from '../middleware/validate.js';
import { validateSchemaBody, validateCommentBody } from '../validators/schema.validator.js';

const router = express.Router({ mergeParams: true });

// Récupération de tous les schémas d'un projet
router.get('/', authenticate, schemaController.getProjectSchemas);

// Récupération des approbations de tous les schémas du projet, en une seule requête
// (déclarée avant /:id_schema, sinon "approvals" serait pris pour un identifiant)
router.get('/approvals', authenticate, schemaController.getProjectApprovals);

// Récupération d'un schéma par son ID
router.get('/:id_schema', authenticate, schemaController.getSchemaById);

// Création d'un nouveau schéma pour un projet (avec fichier obligatoire)
// upload doit passer avant validate : multer est ce qui remplit req.body pour une requête multipart
router.post('/', authenticate, upload.single('file'), validateSchemaBody, validate, schemaController.createSchema);

// Renommage d'un schéma existant (uniquement la personne qui l'a déposé, vérifié dans schema.service.js)
router.put('/:id_schema', authenticate, validateSchemaBody, validate, schemaController.updateSchema);

// Suppression d'un schéma existant (uniquement le owner du projet)
router.delete('/:id_schema', authenticate, isProjectOwner, schemaController.deleteSchema);

// Commentaires d'un schéma, ouverts à tous les membres de l'équipe
router.get('/:id_schema/comments', authenticate, schemaController.getSchemaComments);
router.post('/:id_schema/comments', authenticate, validateCommentBody, validate, schemaController.createComment);

// Suppression d'un commentaire (uniquement son auteur, vérifié dans schema.service.js)
router.delete('/:id_schema/comments/:id_comment', authenticate, schemaController.deleteComment);

// Approbation d'un schéma : le même appel approuve ou retire l'approbation
router.post('/:id_schema/approval', authenticate, schemaController.toggleApproval);

export default router;
