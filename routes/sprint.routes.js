import express from "express"
import sprintController from "../controllers/sprint.controller.js"
import { authenticate  } from "../middleware/auth.middleware.js"
import { isProjectMember } from '../middleware/isProjectMember.middleware.js';
import { isProjectOwner } from "../middleware/isProjectOwner.middleware.js"
import validate from "../middleware/validate.js"
import { validateSprintBody } from "../validators/sprint.validator.js"


const router = express.Router({ mergeParams: true });

// Toutes les routes de ce fichier concernent un projet précis, et sont donc
// réservées aux membres de son équipe. Le contrôle est posé une fois ici plutôt
// que répété sur chaque route : ajouter demain une route sans protection devient
// impossible par oubli. C'est exactement ainsi que la faille relevée aux audits
// était née, être connecté suffisant alors à lire le projet de n'importe qui.
router.use(authenticate, isProjectMember);


// Récupération de tous les sprints d'un projet
router.get("/", sprintController.getProjectSprint);

// Création d'un nouveau sprint pour un projet (uniquement le owner)
router.post("/", isProjectOwner, validateSprintBody, validate, sprintController.createSprint);

// Mise à jour d'un sprint existant, renommage compris (uniquement le owner)
router.put("/:id_sprint", isProjectOwner, validateSprintBody, validate, sprintController.updateSprint);

// Suppression d'un sprint existant pour un projet (uniquement le owner)
router.delete("/:id_sprint", isProjectOwner, sprintController.deleteSprint)

export default router