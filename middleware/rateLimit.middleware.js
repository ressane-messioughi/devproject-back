import rateLimit from 'express-rate-limit';

// Limiteur posé sur la connexion et l'inscription.
// Sans lui, /auth/login accepte un nombre illimité de tentatives : rien n'empêche
// d'essayer des milliers de mots de passe sur une adresse connue.
//
// skipSuccessfulRequests : seules les tentatives ratées sont comptées. Quelqu'un qui se
// connecte normalement plusieurs fois dans la journée n'est jamais bloqué.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // fenêtre de quinze minutes
  limit: 10, // dix échecs par adresse IP sur cette fenêtre
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Trop de tentatives, réessayez dans quinze minutes.' },
});

// Limiteur général sur le reste de l'API, beaucoup plus large : il n'est là que pour
// écarter un client qui partirait en boucle, pas pour gêner un usage normal.
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Trop de requêtes, ralentissez.' },
});
