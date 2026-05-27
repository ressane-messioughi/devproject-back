import express from 'express';

import { getBugs, createBug, updateBug, deleteBug } from '../controllers/bug.controller.js';

const router = express.Router();

router.get('/:projectId', getBugs);

router.post('/:projectId', createBug);

router.put('/:id', updateBug);

router.delete('/:id', deleteBug);

export default router;
