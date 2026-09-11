import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { authenticate } from './auth.middleware.js';

// On definit le secret ici pour ne pas dependre du fichier .env :
// le test doit tourner sur n'importe quelle machine.
process.env.JWT_SECRET = 'secret_test';

describe('authenticate', () => {
  // Faux objet "res". Ses methodes se chainent : status() renvoie res,
  // ce qui permet d'ecrire res.status(401).send(...)
  const mockRes = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    return res;
  };

  it('renvoie 401 si le header Authorization est absent', () => {
    // Arrange
    const req = { headers: {} };
    const res = mockRes();
    const next = vi.fn();

    // Act
    authenticate(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled(); // la requete est bloquee
  });

  it('renvoie 401 si le token est invalide', () => {
    // Arrange
    const req = { headers: { authorization: 'Bearer token_invalide' } };
    const res = mockRes();
    const next = vi.fn();

    // Act
    authenticate(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('appelle next() et renseigne req.user si le token est valide', () => {
    // Arrange : on genere un vrai token signe avec le secret de test
    const payload = { id: 7, role: 'USER' };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = vi.fn();

    // Act
    authenticate(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject(payload);
  });

  // Le cookie httpOnly est desormais le canal normal : l'en-tete Authorization n'est
  // conserve que pour appeler l'API depuis un outil de test.
  it('accepte un jeton valide lu dans le cookie', () => {
    const token = jwt.sign({ id: 12, role: 'USER' }, 'secret_test');
    const req = { headers: {}, cookies: { token } };
    const res = mockRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(12);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('refuse un jeton de cookie signe avec un autre secret', () => {
    const req = { headers: {}, cookies: { token: jwt.sign({ id: 1 }, 'autre_secret') } };
    const res = mockRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('prefere le cookie a l en-tete quand les deux sont presents', () => {
    const req = {
      headers: { authorization: `Bearer ${jwt.sign({ id: 99 }, 'secret_test')}` },
      cookies: { token: jwt.sign({ id: 12 }, 'secret_test') },
    };
    const res = mockRes();
    const next = vi.fn();

    authenticate(req, res, next);

    expect(req.user.id).toBe(12);
  });
});
