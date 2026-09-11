import { body } from 'express-validator';

export const validateSchemaBody = [
  body('name')
    .notEmpty().withMessage('Le nom du schéma est obligatoire')
    .isLength({ max: 100 }).withMessage('100 caractères maximum'),
];

export const validateCommentBody = [
  body('message')
    .notEmpty().withMessage('Le commentaire ne peut pas être vide')
    .isLength({ max: 2000 }).withMessage('2000 caractères maximum'),
];
