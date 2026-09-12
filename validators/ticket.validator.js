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

// Corps attendu pour une campagne d'emails envoyee depuis le panel.
export const validateCampagneBody = [
body("sujet")
.trim()
.notEmpty().withMessage("Objet obligatoire")
.isLength({ max: 200 }).withMessage("Objet trop long (200 caracteres maximum)"),

body("contenu")
.notEmpty().withMessage("Message obligatoire")
// La colonne est un TEXT : au-dela, l'ecriture echouerait avec une erreur SQL
// brute plutot qu'un message comprehensible.
.isLength({ max: 60000 }).withMessage("Message trop long"),

body("destinataires")
.notEmpty().withMessage("Destinataires obligatoires"),
];
