import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

// On definit le secret ici pour ne pas dependre du fichier .env :
// le test doit tourner sur n'importe quelle machine.
process.env.JWT_SECRET = 'secret_test';

// Le middleware interroge desormais la table des sessions : verifier la
// signature du jeton ne suffit plus a laisser passer. Le modele est remplace
// pour que ces tests restent des tests de decision, sans base de donnees.
const sessionModel = {
  findActive: vi.fn(),
  toucher: vi.fn().mockResolvedValue({}),
};

vi.mock('../models/userSession.model.js', () => ({ default: sessionModel }));

const { authenticate } = await import('./auth.middleware.js');

// Un jeton emis apres la mise en place des sessions porte toujours un sid.
const jetonAvecSession = (donnees, sid = 'session-1') =>
  jwt.sign({ ...donnees, sid }, process.env.JWT_SECRET);

describe('authenticate', () => {
  // Faux objet "res". Ses methodes se chainent : status() renvoie res,
  // ce qui permet d'ecrire res.status(401).send(...)
  const mockRes = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Par defaut, la session existe et vit toujours.
    sessionModel.findActive.mockResolvedValue({ id_session: 'session-1', users_id: 7 });
    sessionModel.toucher.mockResolvedValue({});
  });

  it('renvoie 401 si le header Authorization est absent', async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled(); // la requete est bloquee
  });

  it('renvoie 401 si le token est invalide', async () => {
    const req = { headers: { authorization: 'Bearer token_invalide' } };
    const res = mockRes();
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('appelle next() et renseigne req.user si le token est valide', async () => {
    const req = { headers: { authorization: `Bearer ${jetonAvecSession({ id: 7, role: 'USER' })}` } };
    const res = mockRes();
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ id: 7, role: 'USER' });
  });

  // Le cookie httpOnly est desormais le canal normal : l'en-tete Authorization n'est
  // conserve que pour appeler l'API depuis un outil de test.
  it('accepte un jeton valide lu dans le cookie', async () => {
    const req = { headers: {}, cookies: { token: jetonAvecSession({ id: 12, role: 'USER' }) } };
    const res = mockRes();
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(12);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('refuse un jeton de cookie signe avec un autre secret', async () => {
    const req = { headers: {}, cookies: { token: jwt.sign({ id: 1, sid: 's' }, 'autre_secret') } };
    const res = mockRes();
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('prefere le cookie a l en-tete quand les deux sont presents', async () => {
    const req = {
      headers: { authorization: `Bearer ${jetonAvecSession({ id: 99 })}` },
      cookies: { token: jetonAvecSession({ id: 12 }) },
    };
    const res = mockRes();
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(req.user.id).toBe(12);
  });

  // Les trois cas qui font tout l'interet des sessions.
  it('refuse un jeton authentique dont la session a ete revoquee', async () => {
    sessionModel.findActive.mockResolvedValue(undefined);

    const req = { headers: {}, cookies: { token: jetonAvecSession({ id: 12 }) } };
    const res = mockRes();
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('refuse un jeton emis avant la mise en place des sessions', async () => {
    // Signature valable, mais aucun sid : rien ne permettrait de le revoquer.
    const req = { headers: {}, cookies: { token: jwt.sign({ id: 12 }, 'secret_test') } };
    const res = mockRes();
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(sessionModel.findActive).not.toHaveBeenCalled();
  });

  it("laisse passer meme si l'ecriture du dernier passage echoue", async () => {
    // Cette ecriture est accessoire : son echec ne doit pas couper l'acces.
    sessionModel.toucher.mockRejectedValue(new Error('base indisponible'));

    const req = { headers: {}, cookies: { token: jetonAvecSession({ id: 12 }) } };
    const res = mockRes();
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('transmet une panne de la base au gestionnaire d erreur', async () => {
    sessionModel.findActive.mockRejectedValue(new Error('base injoignable'));

    const req = { headers: {}, cookies: { token: jetonAvecSession({ id: 12 }) } };
    const res = mockRes();
    const next = vi.fn();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
  });
});
