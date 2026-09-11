import express from 'express';

import adminController from '../controllers/admin.controller.js';
import ticketController from '../controllers/ticket.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/isAdmin.middleware.js';
import validate from '../middleware/validate.js';
import { validateAnswerBody } from '../validators/ticket.validator.js';

const router = express.Router();

// Toutes les routes de ce fichier sont réservées à l'administration du site.
// Le contrôle est posé une seule fois ici plutôt que répété sur chaque route : en
// ajouter une nouvelle sans protection devient impossible par oubli.
router.use(authenticate, isAdmin);

// Chiffres clés et séries pour les graphiques
router.get('/dashboard', adminController.getDashboard);

// Les grandes listes du site
router.get('/users', adminController.getUsers);
router.get('/projects', adminController.getProjects);
router.get('/schemas', adminController.getSchemas);
router.get('/journals', adminController.getJournals);

// Tickets de support
router.get('/tickets', ticketController.getAllTickets);
router.put('/tickets/:id_ticket', validateAnswerBody, validate, ticketController.answerTicket);
router.delete('/tickets/:id_ticket', ticketController.deleteTicket);

export default router;
