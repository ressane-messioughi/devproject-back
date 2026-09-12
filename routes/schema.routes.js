import express from 'express';

import schemaController from '../controllers/schema.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isProjectMember } from '../middleware/isProjectMember.middleware.js';
import { isProjectOwner } from '../middleware/isProjectOwner.middleware.js';
import upload from '../middleware/upload.middleware.js';
import validate from '../middleware/validate.js';
import { validateSchemaBody, validateCommentBody } from '../validators/schema.validator.js';

const router = express.Router({ mergeParams: true });

// Toutes les routes de ce fichier concernent un projet précis, et sont donc
// réservées aux membres de son équipe. Le contrôle est posé une fois ici plutôt
// que répété sur chaque route : ajouter demain une route sans protection devient
// impossible par oubli. C'est exactement ainsi que la faille relevée aux audits
// était née, être connecté suffisant alors à lire le projet de n'importe qui.
router.use(authenticate, isProjectMember);


// Récupération de tous les schémas d'un projet
router.get('/', schemaController.getProjectSchemas);

// Récupération des approbations de tous les schémas du projet, en une seule requête
// (déclarée avant /:id_schema, sinon "approvals" serait pris pour un identifiant)
router.get('/approvals', schemaController.getProjectApprovals);

// Récupération d'un schéma par son ID
router.get('/:id_schema', schemaController.getSchemaById);

// Création d'un nouveau schéma pour un projet (avec fichier obligatoire)
// upload doit passer avant validate : multer est ce qui remplit req.body pour une requête multipart
router.post('/', upload.single('file'), validateSchemaBody, validate, schemaController.createSchema);

// Renommage d'un schéma existant (uniquement la personne qui l'a déposé, vérifié dans schema.service.js)
router.put('/:id_schema', validateSchemaBody, validate, schemaController.updateSchema);

// Suppression d'un schéma existant (uniquement le owner du projet)
router.delete('/:id_schema', isProjectOwner, schemaController.deleteSchema);

// Commentaires d'un schéma, ouverts à tous les membres de l'équipe
router.get('/:id_schema/comments', schemaController.getSchemaComments);
router.post('/:id_schema/comments', validateCommentBody, validate, schemaController.createComment);

// Suppression d'un commentaire (uniquement son auteur, vérifié dans schema.service.js)
router.delete('/:id_schema/comments/:id_comment', schemaController.deleteComment);

// Approbation d'un schéma : le même appel approuve ou retire l'approbation
router.post('/:id_schema/approval', schemaController.toggleApproval);

export default router;
