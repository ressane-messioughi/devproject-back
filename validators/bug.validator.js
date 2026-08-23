import { body } from 'express-validator';

const BUG_STATUSES = ['OK', 'EN COURS', 'BUG'];

export const validateBugBody = [
  body('title')
    .notEmpty().withMessage('Le titre est obligatoire')
    .isLength({ max: 100 }).withMessage('100 caractères maximum'),
  body('description')
    .notEmpty().withMessage('La description est obligatoire'),
  body('status')
    .optional({ checkFalsy: true })
    .isIn(BUG_STATUSES).withMessage(`Statut invalide (${BUG_STATUSES.join(', ')})`),
];
