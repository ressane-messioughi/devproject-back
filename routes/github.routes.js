import express from 'express';

import {
  connectGithub,
  syncRepository,
  getGithubRepository,
} from '../controllers/github.controller.js';

const router = express.Router();

router.get('/:projectId', getGithubRepository);

router.post('/:projectId/connect', connectGithub);

router.post('/:projectId/sync', syncRepository);

export default router;
