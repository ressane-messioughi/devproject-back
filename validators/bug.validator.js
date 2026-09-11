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
  // Localisation dans le code : entièrement facultative, mais cohérente si elle est fournie
  body('file_path')
    .optional({ checkFalsy: true })
    .isLength({ max: 500 }).withMessage('500 caractères maximum'),
  body('line_start')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 }).withMessage('La ligne de début doit être un nombre positif'),
  body('line_end')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 }).withMessage('La ligne de fin doit être un nombre positif')
    .custom((value, { req }) => {
      if (req.body.line_start && Number(value) < Number(req.body.line_start)) {
        throw new Error('La ligne de fin doit être après la ligne de début');
      }
      return true;
    }),
];
