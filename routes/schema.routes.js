import express from 'express';

import schemaController from '../controllers/schema.controller.js';

const router = express.Router({ mergeParams: true });

// Récupération de tous les schémas d'un projet
router.get('/', schemaController.getProjectSchemas);

// Récupération d'un schéma par son ID
router.get('/:id_schema', schemaController.getSchemaById);

// Création d'un nouveau schéma pour un projet
router.post('/', schemaController.createSchema);

// Mise à jour d'un schéma existant pour un projet
router.put('/:id_schema', schemaController.updateSchema);

// Suppression d'un schéma existant pour un projet
router.delete('/:id_schema', schemaController.deleteSchema);
export default router;
