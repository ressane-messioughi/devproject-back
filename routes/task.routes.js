import express from 'express';

import taskController from "../controllers/task.controller.js"
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true });

router.get("/", authenticate, taskController.getProjectTasks);
router.post("/", authenticate, taskController.createTask);
router.put("/:id_task", authenticate, taskController.updateTask);
router.delete("/:id_task", authenticate, taskController.deleteTask);

export default router;
