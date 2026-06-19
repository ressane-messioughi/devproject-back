import express from 'express';

import projectController from '../controllers/project.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true });

router.get('/', authenticate, projectController.getAllProject);

router.get('/:id_project', authenticate, projectController.getProjectById);

router.post('/', authenticate, projectController.createProject);

router.put('/:id_project', authenticate, projectController.updateProject);

router.delete('/:id_project', authenticate, projectController.removeProject);

export default router;
