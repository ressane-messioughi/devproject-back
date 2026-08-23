import { body } from 'express-validator';

export const validateProjectBody = [
  body('name')
    .notEmpty().withMessage('Le nom du projet est obligatoire')
    .isLength({ min: 6 }).withMessage('Le nom du projet doit contenir au moins 6 caractères')
    .isLength({ max: 100 }).withMessage('100 caractères maximum'),
  body('description')
    .notEmpty().withMessage('La description du projet est obligatoire')
    .isLength({ max: 255 }).withMessage('255 caractères maximum'),
  body('trello_url')
    .optional({ checkFalsy: true })
    .isURL().withMessage('URL Trello invalide'),
];

export const validateJoinBody = [
  body('team_code')
    .notEmpty().withMessage('Code du projet obligatoire'),
];
