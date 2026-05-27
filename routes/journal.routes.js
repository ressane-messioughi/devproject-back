import express from 'express';

import {
  getProjectJournal,
  createJournalEntry,
  deleteJournalEntry,
} from '../controllers/journals.controller.js';

const router = express.Router();

router.get('/:projectId', getProjectJournal);

router.post('/:projectId', createJournalEntry);

router.delete('/:id', deleteJournalEntry);

export default router;
