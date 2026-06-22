import express from 'express';
import journalController from '../controllers/journals.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router({ mergeParams: true });

router.get('/', authenticate, journalController.getProjectMessage);

router.post('/', authenticate, journalController.createMessage); 

router.delete('/:id_journal', authenticate, journalController.deleteMessage);

export default router;
