import express from 'express';

import projectController from '../controllers/project.controller.js';
import joinRequestController from '../controllers/joinRequest.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isProjectOwner } from '../middleware/isProjectOwner.middleware.js';
import { isProjectMember } from '../middleware/isProjectMember.middleware.js';
import { isAdmin } from '../middleware/isAdmin.middleware.js';
import validate from '../middleware/validate.js';
import { validateProjectBody, validateJoinBody } from '../validators/project.validator.js';

const router = express.Router({ mergeParams: true });

// Récupération de tous les projets du site.
//
// Réservée à l'administration. Cette route exécutait un SELECT * FROM project
// et renvoyait donc les projets de tout le monde à n'importe quel compte
// connecté. Aucun écran de l'application ne l'appelle : le panel utilisateur
// passe par /my-project, et le panel d'administration par /api/admin/projects.
router.get('/', authenticate, isAdmin, projectController.getAllProject);

// Récupération de tous les projets auxquels l'utilisateur appartient
router.get("/my-project", authenticate, projectController.getMyProject)

// Récupération de toutes les demandes de rejoindre un projet.
// Ces demandes portent le nom et l'adresse des candidats : elles ne regardent
// que l'équipe concernée.
router.get("/:id_project/requests", authenticate, isProjectMember, joinRequestController.getAllRequestByProject)

// Accepter une demande de rejoindre un projet (uniquement le owner)
router.put("/:id_project/requests/:id_request/accept", authenticate, isProjectMember, isProjectOwner, joinRequestController.acceptRequest);

// Refuser une demande de rejoindre un projet (uniquement le owner)
router.put("/:id_project/requests/:id_request/refuse", authenticate, isProjectMember, isProjectOwner, joinRequestController.refuseRequest);

// Récupération d'un projet par son ID.
// Sans le contrôle d'appartenance, il suffisait de changer le numéro dans
// l'adresse pour lire le nom, la description et le code d'équipe d'un projet
// auquel on n'appartient pas.
router.get('/:id_project', authenticate, isProjectMember, projectController.getProjectById);

// Création d'un nouveau projet
router.post('/', authenticate, validateProjectBody, validate, projectController.createProject);

// Mise à jour d'un projet existant, renommage compris (uniquement le owner)
router.put('/:id_project', authenticate, isProjectMember, isProjectOwner, validateProjectBody, validate, projectController.updateProject);

// Suppression d'un projet existant (uniquement le owner)
router.delete('/:id_project', authenticate, isProjectMember, isProjectOwner, projectController.removeProject);

// Création d'une demande de rejoindre un projet
router.post("/join", authenticate, validateJoinBody, validate, joinRequestController.createRequest);




export default router;
