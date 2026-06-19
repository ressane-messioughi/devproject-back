import express from 'express';

import {
  getSchemas,
  createSchema,
  updateSchema,
  deleteSchema,
} from '../controllers/schema.controller.js';

const router = express.Router({ mergeParams: true });

router.get('/:projectId', getSchemas);

router.post('/:projectId', createSchema);

router.put('/:id', updateSchema);

router.delete('/:id', deleteSchema);

export default router;
