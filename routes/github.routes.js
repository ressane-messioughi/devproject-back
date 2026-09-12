import express from 'express';

import githubController from "../controllers/github.controller.js"
import { authenticate } from '../middleware/auth.middleware.js';
import { isProjectMember } from '../middleware/isProjectMember.middleware.js';
import validate from '../middleware/validate.js';
import { validateGithubBody } from '../validators/github.validator.js';

const router = express.Router({ mergeParams: true });

// Toutes les routes de ce fichier concernent un projet précis, et sont donc
// réservées aux membres de son équipe. Le contrôle est posé une fois ici plutôt
// que répété sur chaque route : ajouter demain une route sans protection devient
// impossible par oubli. C'est exactement ainsi que la faille relevée aux audits
// était née, être connecté suffisant alors à lire le projet de n'importe qui.
router.use(authenticate, isProjectMember);


// Récupération de tous les dépôts GitHub d'un projet
router.get("/", githubController.getProjectRepositories);

// Récupération des derniers commits d'un dépôt, lus sur l'API GitHub
router.get("/:id_repository/commits", githubController.getRepositoryCommits);

// Liste des fichiers du dépôt, pour désigner celui qui contient le bug
router.get("/:id_repository/tree", githubController.getRepositoryTree);

// Vérification que le dépôt est accessible avec les autorisations dont dispose le serveur
router.get("/:id_repository/access", githubController.getRepositoryAccess);

// Téléchargement de l'archive du dépôt, l'équivalent d'un clone depuis le navigateur
router.get("/:id_repository/archive", githubController.getRepositoryArchive);

// Création d'un nouveau dépôt GitHub pour un projet
router.post("/", validateGithubBody, validate, githubController.createRepository);

// Mise à jour d'un dépôt GitHub existant pour un projet
router.put("/:id_repository", validateGithubBody, validate, githubController.updateRepository);

// Suppression d'un dépôt GitHub existant pour un projet
router.delete("/:id_repository", githubController.deleteRepository);

export default router;
