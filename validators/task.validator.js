import { body } from 'express-validator';

const TASK_STATUSES = ['FAIT', 'EN COURS', 'NON FAIT'];

export const validateTaskBody = [
  body('title')
    .notEmpty().withMessage('Le titre de la tâche est obligatoire')
    .isLength({ max: 255 }).withMessage('255 caractères maximum'),
  body('status')
    .optional({ checkFalsy: true })
    .isIn(TASK_STATUSES).withMessage(`Statut invalide (${TASK_STATUSES.join(', ')})`),
];
