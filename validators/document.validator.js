import { body } from 'express-validator';

export const validateDocumentBody = [
  body('name')
    .notEmpty().withMessage('Le nom du document est obligatoire')
    .isLength({ max: 150 }).withMessage('150 caractères maximum'),
  body('description')
    .optional({ checkFalsy: true })
    .isLength({ max: 255 }).withMessage('255 caractères maximum'),
];
