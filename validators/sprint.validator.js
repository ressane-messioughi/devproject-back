import { body } from 'express-validator';

const SPRINT_STATUSES = ['PASSED', 'ACTUALLY', 'NEXT'];

export const validateSprintBody = [
  body('name')
    .notEmpty().withMessage('Le nom du sprint est obligatoire')
    .isLength({ max: 100 }).withMessage('100 caractères maximum'),
  body('start_date')
    .notEmpty().withMessage('La date de début est obligatoire')
    .isDate().withMessage('Date de début invalide'),
  body('end_date')
    .notEmpty().withMessage('La date de fin est obligatoire')
    .isDate().withMessage('Date de fin invalide'),
  body('status')
    .optional({ checkFalsy: true })
    .isIn(SPRINT_STATUSES).withMessage(`Statut invalide (${SPRINT_STATUSES.join(', ')})`),
];
