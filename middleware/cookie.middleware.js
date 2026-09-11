// Réglages du cookie qui porte le jeton de session.
//
// httpOnly est le point central de tout ce fichier : JavaScript ne peut pas lire ce
// cookie. Une faille XSS sur le site ne permet donc plus de voler la session, ce qui
// était impossible à garantir avec localStorage.
//
// sameSite lax : le cookie part sur les requêtes vers notre API et sur la navigation
// normale, mais pas sur une requête déclenchée depuis un autre site — c'est la
// protection contre la falsification de requête (CSRF).
//
// secure : le cookie n'est transmis qu'en HTTPS. Désactivé en développement, où le
// serveur tourne en http://localhost et où le navigateur refuserait donc le cookie.
export const COOKIE_NAME = 'token';

export const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 2 * 60 * 60 * 1000, // deux heures, comme la durée de validité du jeton
  path: '/',
});

// Les options de suppression doivent reprendre celles de la pose, path compris :
// un cookie posé sur "/" ne peut pas être supprimé par un effacement sur un autre chemin.
export const clearCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
});
