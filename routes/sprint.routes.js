import express from "express"
import sprintController from "../controllers/sprint.controller.js"
import { authenticate  } from "../middleware/auth.middleware.js"
import { isProjectOwner } from "../middleware/isProjectOwner.middleware.js"
import validate from "../middleware/validate.js"
import { validateSprintBody } from "../validators/sprint.validator.js"


const router = express.Router({ mergeParams: true });

// Récupération de tous les sprints d'un projet
router.get("/", authenticate, sprintController.getProjectSprint);

// Création d'un nouveau sprint pour un projet (uniquement le owner)
router.post("/", authenticate, isProjectOwner, validateSprintBody, validate, sprintController.createSprint);

// Mise à jour d'un sprint existant, renommage compris (uniquement le owner)
router.put("/:id_sprint", authenticate, isProjectOwner, validateSprintBody, validate, sprintController.updateSprint);

// Suppression d'un sprint existant pour un projet (uniquement le owner)
router.delete("/:id_sprint", authenticate, isProjectOwner, sprintController.deleteSprint)

export default router