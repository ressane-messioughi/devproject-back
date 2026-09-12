import express from 'express';

import taskController from "../controllers/task.controller.js"
import { authenticate } from '../middleware/auth.middleware.js';
import { isProjectMember } from '../middleware/isProjectMember.middleware.js';
import validate from '../middleware/validate.js';
import { validateTaskBody } from '../validators/task.validator.js';

const router = express.Router({ mergeParams: true });

// Toutes les routes de ce fichier concernent un projet précis, et sont donc
// réservées aux membres de son équipe. Le contrôle est posé une fois ici plutôt
// que répété sur chaque route : ajouter demain une route sans protection devient
// impossible par oubli. C'est exactement ainsi que la faille relevée aux audits
// était née, être connecté suffisant alors à lire le projet de n'importe qui.
router.use(authenticate, isProjectMember);


// Récupération de toutes les tâches d'un projet
router.get("/", taskController.getProjectTasks);

// Création d'une nouvelle tâche
router.post("/", validateTaskBody, validate, taskController.createTask);

// Mise à jour d'une tâche existante
router.put("/:id_task", validateTaskBody, validate, taskController.updateTask);

// Suppression d'une tâche existante
router.delete("/:id_task", taskController.deleteTask);

export default router;
