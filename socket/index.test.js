import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'secret_test';

// Le handshake verifie desormais la session en plus de la signature : le modele
// est remplace pour que ces tests restent des tests de decision.
const sessionModel = {
  findActive: vi.fn(),
};

vi.mock('../models/userSession.model.js', () => ({ default: sessionModel }));

const { authenticateSocket } = await import('./index.js');

// Le controle du handshake est ce qui empeche n'importe qui d'ouvrir une connexion
// Socket.IO et de demander les evenements d'un projet. Sans ces tests, une regression
// rouvrirait la faille sans qu'aucun ecran ne le montre.
describe('authenticateSocket', () => {
  const faireSocket = (cookie) => ({
    handshake: { headers: cookie ? { cookie } : {} },
    data: {},
  });

  const jetonAvecSession = (donnees, sid = 'session-1') =>
    jwt.sign({ ...donnees, sid }, 'secret_test');

  beforeEach(() => {
    vi.clearAllMocks();
    sessionModel.findActive.mockResolvedValue({ id_session: 'session-1', users_id: 42 });
  });

  it('refuse une connexion sans cookie', async () => {
    const next = vi.fn();
    await authenticateSocket(faireSocket(undefined), next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toContain('Accès refusé');
  });

  it('refuse un cookie qui ne contient pas le jeton', async () => {
    const next = vi.fn();
    await authenticateSocket(faireSocket('theme=dark; langue=fr'), next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('refuse un jeton signe avec un autre secret', async () => {
    const faux = jwt.sign({ id: 1, sid: 's' }, 'mauvais_secret');
    const next = vi.fn();

    await authenticateSocket(faireSocket(`token=${faux}`), next);

    expect(next.mock.calls[0][0].message).toContain('Token invalide');
  });

  // Le point essentiel : l'identite vient du jeton et jamais des donnees envoyees par
  // le client, qui pourrait sinon se faire passer pour quelqu'un d'autre.
  it('accepte un jeton valide et pose l identite lue dedans', async () => {
    const socket = faireSocket(`token=${jetonAvecSession({ id: 42, username: 'Ressane' })}`);
    const next = vi.fn();

    await authenticateSocket(socket, next);

    expect(next).toHaveBeenCalledWith();
    expect(socket.data.user.id).toBe(42);
    expect(socket.data.user.username).toBe('Ressane');
  });

  it('lit le jeton meme entoure d autres cookies', async () => {
    const socket = faireSocket(`theme=dark; token=${jetonAvecSession({ id: 7 })}; langue=fr`);
    const next = vi.fn();

    await authenticateSocket(socket, next);

    expect(socket.data.user.id).toBe(7);
  });

  // Sans ce controle, revoquer une session fermerait la porte HTTP mais
  // laisserait le temps reel ouvert : la personne continuerait de recevoir les
  // notifications de l'equipe et de figurer parmi les membres en ligne.
  it('refuse un jeton authentique dont la session a ete revoquee', async () => {
    sessionModel.findActive.mockResolvedValue(undefined);

    const socket = faireSocket(`token=${jetonAvecSession({ id: 42 })}`);
    const next = vi.fn();

    await authenticateSocket(socket, next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(next.mock.calls[0][0].message).toContain('révoquée');
    expect(socket.data.user).toBeUndefined();
  });

  it('refuse un jeton emis avant la mise en place des sessions', async () => {
    const socket = faireSocket(`token=${jwt.sign({ id: 42 }, 'secret_test')}`);
    const next = vi.fn();

    await authenticateSocket(socket, next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(sessionModel.findActive).not.toHaveBeenCalled();
  });

  it('refuse la connexion si la base est injoignable, plutot que de laisser passer', async () => {
    sessionModel.findActive.mockRejectedValue(new Error('base injoignable'));

    const socket = faireSocket(`token=${jetonAvecSession({ id: 42 })}`);
    const next = vi.fn();

    await authenticateSocket(socket, next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(socket.data.user).toBeUndefined();
  });
});
