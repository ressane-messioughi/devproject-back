import AppError from './AppError.js';

// Middleware qui réserve une route aux administrateurs du site.
//
// Le rôle est lu dans req.user, donc dans le jeton vérifié par authenticate : il ne peut
// pas être trafiqué depuis le navigateur. isAdmin doit toujours être placé après
// authenticate, sans quoi req.user n'existe pas encore.
//
// À ne pas confondre avec isProjectOwner : celui-là porte sur un projet précis, celui-ci
// sur l'ensemble du site.
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return next(new AppError("Accès réservé à l'administration du site", 403));
  }
  next();
};
