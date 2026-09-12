import { body } from 'express-validator';

const MODES = ['VISIO', 'PRESENTIEL'];

export const validateDailyBody = [
  body('scheduled_at')
    .notEmpty().withMessage("L'heure du point est obligatoire"),
  body('duration_minutes')
    .optional({ checkFalsy: true })
    .isInt({ min: 5, max: 120 }).withMessage('Entre 5 et 120 minutes'),
  body('mode')
    .notEmpty().withMessage('Le mode est obligatoire')
    .isIn(MODES).withMessage(`Mode invalide (${MODES.join(', ')})`),

  // En visio le lien est indispensable, en présentiel c'est le lieu : sans l'un ou
  // l'autre, l'équipe reçoit une annonce sans savoir où se rendre.
  body('link')
    .if(body('mode').equals('VISIO'))
    .notEmpty().withMessage('Le lien de la visio est obligatoire')
    .isURL().withMessage('Lien invalide'),
  body('location')
    .if(body('mode').equals('PRESENTIEL'))
    .notEmpty().withMessage('Le lieu est obligatoire')
    .isLength({ max: 150 }).withMessage('150 caractères maximum'),
  body('note')
    .optional({ checkFalsy: true })
    .isLength({ max: 255 }).withMessage('255 caractères maximum'),
];
