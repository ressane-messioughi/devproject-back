import express from 'express';

import githubController from "../controllers/github.controller.js"
import { authenticate } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.js';
import { validateGithubBody } from '../validators/github.validator.js';

const router = express.Router({ mergeParams: true });

// Récupération de tous les dépôts GitHub d'un projet
router.get("/", authenticate, githubController.getProjectRepositories);

// Récupération des derniers commits d'un dépôt, lus sur l'API GitHub
router.get("/:id_repository/commits", authenticate, githubController.getRepositoryCommits);

// Liste des fichiers du dépôt, pour désigner celui qui contient le bug
router.get("/:id_repository/tree", authenticate, githubController.getRepositoryTree);

// Vérification que le dépôt est accessible avec les autorisations dont dispose le serveur
router.get("/:id_repository/access", authenticate, githubController.getRepositoryAccess);

// Téléchargement de l'archive du dépôt, l'équivalent d'un clone depuis le navigateur
router.get("/:id_repository/archive", authenticate, githubController.getRepositoryArchive);

// Création d'un nouveau dépôt GitHub pour un projet
router.post("/", authenticate, validateGithubBody, validate, githubController.createRepository);

// Mise à jour d'un dépôt GitHub existant pour un projet
router.put("/:id_repository", authenticate, validateGithubBody, validate, githubController.updateRepository);

// Suppression d'un dépôt GitHub existant pour un projet
router.delete("/:id_repository", authenticate, githubController.deleteRepository);

export default router;
