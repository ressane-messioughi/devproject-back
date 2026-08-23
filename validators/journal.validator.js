import { body } from 'express-validator';

export const validateJournalBody = [
  body('title')
    .notEmpty().withMessage('Le titre est obligatoire')
    .isLength({ max: 100 }).withMessage('100 caractères maximum'),
  body('message')
    .notEmpty().withMessage('Le message est obligatoire'),
];
