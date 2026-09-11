import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { authenticateSocket } from './index.js';

process.env.JWT_SECRET = 'secret_test';

// Le controle du handshake est ce qui empeche n'importe qui d'ouvrir une connexion
// Socket.IO et de demander les evenements d'un projet. Sans ces tests, une regression
// rouvrirait la faille sans qu'aucun ecran ne le montre.
describe('authenticateSocket', () => {
  const faireSocket = (cookie) => ({
    handshake: { headers: cookie ? { cookie } : {} },
    data: {},
  });

  it('refuse une connexion sans cookie', async () => {
    const next = vi.fn();
    authenticateSocket(faireSocket(undefined), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toContain('Accès refusé');
  });

  it('refuse un cookie qui ne contient pas le jeton', async () => {
    const next = vi.fn();
    authenticateSocket(faireSocket('theme=dark; langue=fr'), next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('refuse un jeton signe avec un autre secret', async () => {
    const faux = jwt.sign({ id: 1 }, 'mauvais_secret');
    const next = vi.fn();

    await new Promise((resolve) => {
      authenticateSocket(faireSocket(`token=${faux}`), (erreur) => {
        expect(erreur.message).toContain('Token invalide');
        resolve();
      });
    });

    expect(next).not.toHaveBeenCalled();
  });

  // Le point essentiel : l'identite vient du jeton et jamais des donnees envoyees par
  // le client, qui pourrait sinon se faire passer pour quelqu'un d'autre.
  it('accepte un jeton valide et pose l identite lue dedans', async () => {
    const valide = jwt.sign({ id: 42, username: 'Ressane' }, 'secret_test');
    const socket = faireSocket(`token=${valide}`);

    await new Promise((resolve) => {
      authenticateSocket(socket, (erreur) => {
        expect(erreur).toBeUndefined();
        resolve();
      });
    });

    expect(socket.data.user.id).toBe(42);
    expect(socket.data.user.username).toBe('Ressane');
  });

  it('lit le jeton meme entoure d autres cookies', async () => {
    const valide = jwt.sign({ id: 7 }, 'secret_test');
    const socket = faireSocket(`theme=dark; token=${valide}; langue=fr`);

    await new Promise((resolve) => {
      authenticateSocket(socket, () => resolve());
    });

    expect(socket.data.user.id).toBe(7);
  });
});
