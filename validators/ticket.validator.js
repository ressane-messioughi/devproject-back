import { body } from 'express-validator';

const CATEGORIES = ['COMPTE', 'PROJET', 'BUG', 'DONNEES', 'AUTRE'];
const STATUTS = ['OUVERT', 'EN COURS', 'RESOLU'];

export const validateTicketBody = [
  body('subject')
    .notEmpty().withMessage("L'objet de la demande est obligatoire")
    .isLength({ max: 150 }).withMessage('150 caractères maximum'),
  body('message')
    .notEmpty().withMessage('Le message est obligatoire')
    .isLength({ max: 5000 }).withMessage('5000 caractères maximum'),
  body('category')
    .optional({ checkFalsy: true })
    .isIn(CATEGORIES).withMessage(`Catégorie invalide (${CATEGORIES.join(', ')})`),
];

export const validateAnswerBody = [
  body('status')
    .notEmpty().withMessage('Le statut est obligatoire')
    .isIn(STATUTS).withMessage(`Statut invalide (${STATUTS.join(', ')})`),
  body('answer')
    .optional({ checkFalsy: true })
    .isLength({ max: 5000 }).withMessage('5000 caractères maximum'),
];
