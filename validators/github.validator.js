import { body } from 'express-validator';

export const validateGithubBody = [
  body('name')
    .notEmpty().withMessage('Le nom du dépôt est obligatoire')
    .isLength({ max: 100 }).withMessage('100 caractères maximum'),
  body('url')
    .notEmpty().withMessage("L'URL du dépôt est obligatoire")
    .isURL().withMessage('URL invalide')
    .contains('github.com').withMessage('L\'URL doit pointer vers github.com'),
  body('branch')
    .notEmpty().withMessage('La branche est obligatoire')
    .isLength({ max: 255 }).withMessage('255 caractères maximum'),
];
