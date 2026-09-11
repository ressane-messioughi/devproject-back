import { body } from 'express-validator';

export const validateSchemaBody = [
  body('name')
    .notEmpty().withMessage('Le nom du schéma est obligatoire')
    .isLength({ max: 100 }).withMessage('100 caractères maximum'),
];
