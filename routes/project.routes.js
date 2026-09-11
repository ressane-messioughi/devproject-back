import express from 'express';

import projectController from '../controllers/project.controller.js';
import joinRequestController from '../controllers/joinRequest.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isProjectOwner } from '../middleware/isProjectOwner.middleware.js';
import validate from '../middleware/validate.js';
import { validateProjectBody, validateJoinBody } from '../validators/project.validator.js';

const router = express.Router({ mergeParams: true });

// Récupération de tous les projets
router.get('/', authenticate, projectController.getAllProject);

// Récupération de tous les projets auxquels l'utilisateur appartient
router.get("/my-project", authenticate, projectController.getMyProject)

// Récupération de toutes les demandes de rejoindre un projet
router.get("/:id_project/requests", authenticate, joinRequestController.getAllRequestByProject)

// Accepter une demande de rejoindre un projet (uniquement le owner)
router.put("/:id_project/requests/:id_request/accept", authenticate, isProjectOwner, joinRequestController.acceptRequest);

// Refuser une demande de rejoindre un projet (uniquement le owner)
router.put("/:id_project/requests/:id_request/refuse", authenticate, isProjectOwner, joinRequestController.refuseRequest);

// Récupération d'un projet par son ID
router.get('/:id_project', authenticate, projectController.getProjectById);

// Création d'un nouveau projet
router.post('/', authenticate, validateProjectBody, validate, projectController.createProject);

// Mise à jour d'un projet existant, renommage compris (uniquement le owner)
router.put('/:id_project', authenticate, isProjectOwner, validateProjectBody, validate, projectController.updateProject);

// Suppression d'un projet existant (uniquement le owner)
router.delete('/:id_project', authenticate, isProjectOwner, projectController.removeProject);

// Création d'une demande de rejoindre un projet
router.post("/join", authenticate, validateJoinBody, validate, joinRequestController.createRequest);




export default router;
