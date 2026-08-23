import express from 'express';

import taskController from "../controllers/task.controller.js"
import { authenticate } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.js';
import { validateTaskBody } from '../validators/task.validator.js';

const router = express.Router({ mergeParams: true });

// Récupération de toutes les tâches d'un projet
router.get("/", authenticate, taskController.getProjectTasks);

// Création d'une nouvelle tâche
router.post("/", authenticate, validateTaskBody, validate, taskController.createTask);

// Mise à jour d'une tâche existante
router.put("/:id_task", authenticate, validateTaskBody, validate, taskController.updateTask);

// Suppression d'une tâche existante
router.delete("/:id_task", authenticate, taskController.deleteTask);

export default router;
