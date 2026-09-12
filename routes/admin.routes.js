import express from 'express';

import adminController from '../controllers/admin.controller.js';
import ticketController from '../controllers/ticket.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/isAdmin.middleware.js';
import { auditAdmin } from '../middleware/auditAdmin.middleware.js';
import validate from '../middleware/validate.js';
import { validateAnswerBody } from '../validators/ticket.validator.js';

const router = express.Router();

// Toutes les routes de ce fichier sont réservées à l'administration du site.
// Le contrôle est posé une seule fois ici plutôt que répété sur chaque route : en
// ajouter une nouvelle sans protection devient impossible par oubli.
router.use(authenticate, isAdmin);

// Journal d'audit. Pose une fois sur le routeur plutot qu'appele depuis chaque
// controleur : une action ajoutee demain est tracee par defaut, la ou une
// fonction a appeler aurait fini par etre oubliee sans que rien ne le montre.
router.use(auditAdmin);

// Chiffres clés et séries pour les graphiques
router.get('/dashboard', adminController.getDashboard);

// Les grandes listes du site
router.get('/users', adminController.getUsers);
router.get('/projects', adminController.getProjects);
router.get('/schemas', adminController.getSchemas);
router.get('/journals', adminController.getJournals);

// Sessions ouvertes : les lister, en fermer une, ou toutes celles d'un compte.
// C'est ce qui permet de couper immediatement un acces compromis, sans attendre
// l'expiration du jeton.
router.get('/sessions', adminController.getSessions);
router.delete('/sessions/:id_session', adminController.revoquerSession);
router.delete('/users/:id_user/sessions', adminController.revoquerSessionsUtilisateur);

// Journal d'audit, en lecture seule : aucune route ne permet d'en effacer une
// ligne, ce qui serait contradictoire avec sa raison d'etre.
router.get('/audit', adminController.getAudit);

// Tickets de support
router.get('/tickets', ticketController.getAllTickets);
router.put('/tickets/:id_ticket', validateAnswerBody, validate, ticketController.answerTicket);
router.delete('/tickets/:id_ticket', ticketController.deleteTicket);

export default router;
