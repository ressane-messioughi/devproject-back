import express from 'express';

import { getTasks, createTask, updateTask, deleteTask } from '../controllers/task.controller.js';

const router = express.Router();

router.get('/:projectId', getTasks);

router.post('/:projectId', createTask);

router.put('/:id', updateTask);

router.delete('/:id', deleteTask);

export default router;
