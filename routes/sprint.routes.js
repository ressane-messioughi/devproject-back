import express from "express"
import sprintController from "../controllers/sprint.controller.js"
import { authenticate  } from "../middleware/auth.middleware.js"


const router = express.Router({ mergeParams: true });

// Récupération de tous les sprints d'un projet
router.get("/", authenticate, sprintController.getProjectSprint);

// Création d'un nouveau sprint pour un projet
router.post("/", authenticate, sprintController.createSprint);

// Mise à jour d'un sprint existant pour un projet
router.put("/:id_sprint", authenticate, sprintController.updateSprint);

// Suppression d'un sprint existant pour un projet
router.delete("/:id_sprint", authenticate, sprintController.deleteSprint)

export default router