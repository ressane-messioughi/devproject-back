import { describe, it, expect, afterEach } from 'vitest';
import { COOKIE_NAME, cookieOptions, clearCookieOptions } from './cookie.middleware.js';

// Ces reglages sont ce qui empeche une faille XSS de voler la session : ils meritent
// d'etre verifies, une regression ici ne se verrait sur aucun ecran.
describe('reglages du cookie de session', () => {
  const envInitial = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = envInitial;
  });

  it('interdit la lecture par JavaScript', () => {
    expect(cookieOptions().httpOnly).toBe(true);
  });

  it('limite l envoi aux requetes venant du site (protection CSRF)', () => {
    expect(cookieOptions().sameSite).toBe('lax');
  });

  it('exige HTTPS en production seulement', () => {
    process.env.NODE_ENV = 'production';
    expect(cookieOptions().secure).toBe(true);

    process.env.NODE_ENV = 'development';
    expect(cookieOptions().secure).toBe(false);
  });

  it('expire au bout de deux heures, comme le jeton', () => {
    expect(cookieOptions().maxAge).toBe(2 * 60 * 60 * 1000);
  });

  // Un cookie pose sur "/" ne peut pas etre supprime par un effacement sur un autre
  // chemin : les deux jeux d'options doivent porter le meme path.
  it('supprime le cookie sur le meme chemin que la pose', () => {
    expect(clearCookieOptions().path).toBe(cookieOptions().path);
    expect(clearCookieOptions().httpOnly).toBe(true);
  });

  it('utilise partout le meme nom de cookie', () => {
    expect(COOKIE_NAME).toBe('token');
  });
});
