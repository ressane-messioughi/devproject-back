import express from 'express';

import githubController from "../controllers/github.controller.js"
import { authenticate } from '../middleware/auth.middleware.js';


const router = express.Router({ mergeParams: true });

// Récupération de tous les dépôts GitHub d'un projet
router.get("/", authenticate, githubController.getProjectRepositories);

// Création d'un nouveau dépôt GitHub pour un projet
router.post("/", authenticate, githubController.createRepository);

// Mise à jour d'un dépôt GitHub existant pour un projet
router.put("/:id_repository", authenticate, githubController.updateRepository);

// Suppression d'un dépôt GitHub existant pour un projet
router.delete("/:id_repository", authenticate, githubController.deleteRepository);

export default router;
