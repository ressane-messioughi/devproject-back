import express from 'express';

import projectController from '../controllers/project.controller.js';
import joinRequestController from '../controllers/joinRequest.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true });

// Récupération de tous les projets
router.get('/', authenticate, projectController.getAllProject);

// Récupération de tous les projets auxquels l'utilisateur appartient
router.get("/my-project", authenticate, projectController.getMyProject)

// Récupération de toutes les demandes de rejoindre un projet
router.get("/:id_project/requests", authenticate, joinRequestController.getAllRequestByProject)

// Accepter une demande de rejoindre un projet
router.put("/:id_project/requests/:id_request/accept", authenticate, joinRequestController.acceptRequest);

// Refuser une demande de rejoindre un projet
router.put("/:id_project/requests/:id_request/refuse", authenticate, joinRequestController.refuseRequest);

// Récupération d'un projet par son ID
router.get('/:id_project', authenticate, projectController.getProjectById);

// Création d'un nouveau projet
router.post('/', authenticate, projectController.createProject);

// Mise à jour d'un projet existant
router.put('/:id_project', authenticate, projectController.updateProject);

// Suppression d'un projet existant
router.delete('/:id_project', authenticate, projectController.removeProject);

// Création d'une demande de rejoindre un projet
router.post("/join", authenticate, joinRequestController.createRequest);




export default router;
