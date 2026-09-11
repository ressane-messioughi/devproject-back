import express from 'express';

import ticketController from '../controllers/ticket.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.js';
import { validateTicketBody } from '../validators/ticket.validator.js';

const router = express.Router();

// Ouverture d'une demande d'aide, ouverte à tous les membres connectés
router.post('/', authenticate, validateTicketBody, validate, ticketController.createTicket);

// Consultation de ses propres demandes et des réponses reçues
router.get('/me', authenticate, ticketController.getMyTickets);

export default router;
