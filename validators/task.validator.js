import { body } from 'express-validator';

const TASK_STATUSES = ['FAIT', 'EN COURS', 'NON FAIT'];

export const validateTaskBody = [
  body('title')
    .notEmpty().withMessage('Le titre de la tâche est obligatoire')
    .isLength({ max: 255 }).withMessage('255 caractères maximum'),
  body('description')
    .optional({ checkFalsy: true })
    .isLength({ max: 255 }).withMessage('255 caractères maximum'),
  // assigned_to est NOT NULL en base : sans lui l'INSERT échoue avec l'erreur 1048
  body('assigned_to')
    .notEmpty().withMessage('La tâche doit être confiée à un membre')
    .isInt().withMessage('Membre invalide'),
  body('status')
    .optional({ checkFalsy: true })
    .isIn(TASK_STATUSES).withMessage(`Statut invalide (${TASK_STATUSES.join(', ')})`),
];
