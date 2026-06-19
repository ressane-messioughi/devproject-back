import express from 'express';

import projectController from '../controllers/project.controller.js';

const router = express.Router({ mergeParams: true });

router.get('/', projectController.getAllProject);

router.get('/:id_project', projectController.getProjectById);

router.post('/', projectController.createProject);

router.put('/:id_project', projectController.updateProject);

router.delete('/:id_project', projectController.removeProject);

export default router;
