import express from 'express';

import projectController from '../controllers/project.controller.js';
import joinRequestController from '../controllers/joinRequest.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true });

router.get('/', authenticate, projectController.getAllProject);

router.get("/my-project", authenticate, projectController.getMyProject)

router.get("/:id_project/requests", authenticate, joinRequestController.getAllRequestByProject)

router.put("/:id_project/requests/:id_request/accept", authenticate, joinRequestController.acceptRequest);

router.put("/:id_project/requests/:id_request/refuse", authenticate, joinRequestController.refuseRequest);

router.get('/:id_project', authenticate, projectController.getProjectById);

router.post('/', authenticate, projectController.createProject);

router.put('/:id_project', authenticate, projectController.updateProject);

router.delete('/:id_project', authenticate, projectController.removeProject);
// =============================================================================================================================
router.post("/join", authenticate, joinRequestController.createRequest);




export default router;
