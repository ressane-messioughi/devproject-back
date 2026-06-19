import express from 'express';

import journalController from '../controllers/journals.controller.js';

const router = express.Router({ mergeParams: true });

router.get('/', journalController.getAll);

router.post('/', journalController.createMessage); 

router.delete('/:id_journal', journalController.deleteMessage);

export default router;
