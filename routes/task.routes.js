import express from 'express';

import { getTasks, createTask, updateTask, deleteTask } from '../controllers/task.controller.js';

const router = express.Router({ mergeParams: true });

router.get('/:project_id/task/', getTasks);

router.post('/:project_id/task/', createTask);

router.put('/:project_id/task/:task_id', updateTask);

router.delete('/project_id/task/:task_id', deleteTask);

export default router;
