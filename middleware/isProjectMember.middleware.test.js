import { describe, it, expect, vi, beforeEach } from 'vitest';

// Le modèle est remplacé : ces tests portent sur la décision du middleware, pas
// sur la base. Ce qui doit être vérifié ici, c'est qu'il laisse passer un membre
// et bloque tous les autres cas.
const teamModel = {
  findByProjectId: vi.fn(),
  getUserRole: vi.fn(),
};

vi.mock('../models/team.model.js', () => ({ default: teamModel }));

const { isProjectMember } = await import('./isProjectMember.middleware.js');

const faireRequete = (id_project = '7') => ({ params: { id_project }, user: { id: 42 } });

describe('isProjectMember', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("laisse passer un membre de l'équipe", async () => {
    teamModel.findByProjectId.mockResolvedValue({ id_team: 3 });
    teamModel.getUserRole.mockResolvedValue({ role: 'MEMBER', team_role: 'Dev' });

    const req = faireRequete();
    const next = vi.fn();
    await isProjectMember(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.team).toEqual({ id_team: 3 });
    expect(req.membership).toEqual({ role: 'MEMBER', team_role: 'Dev' });
  });

  it("bloque un compte qui ne fait pas partie de l'équipe", async () => {
    teamModel.findByProjectId.mockResolvedValue({ id_team: 3 });
    teamModel.getUserRole.mockResolvedValue(undefined);

    const next = vi.fn();
    await isProjectMember(faireRequete(), {}, next);

    const erreur = next.mock.calls[0][0];
    expect(erreur).toBeDefined();
    expect(erreur.statusCode).toBe(404);
  });

  it('repond la meme chose pour un projet inexistant et pour un projet interdit', async () => {
    // Distinguer les deux permettrait de decouvrir quels projets existent en
    // parcourant les numeros : les deux reponses doivent etre indiscernables.
    teamModel.findByProjectId.mockResolvedValue(undefined);
    const nextInexistant = vi.fn();
    await isProjectMember(faireRequete(), {}, nextInexistant);

    teamModel.findByProjectId.mockResolvedValue({ id_team: 3 });
    teamModel.getUserRole.mockResolvedValue(undefined);
    const nextInterdit = vi.fn();
    await isProjectMember(faireRequete(), {}, nextInterdit);

    const a = nextInexistant.mock.calls[0][0];
    const b = nextInterdit.mock.calls[0][0];
    expect(a.statusCode).toBe(b.statusCode);
    expect(a.message).toBe(b.message);
  });

  it('refuse une requete sans numero de projet', async () => {
    const next = vi.fn();
    await isProjectMember({ params: {}, user: { id: 42 } }, {}, next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
    expect(teamModel.findByProjectId).not.toHaveBeenCalled();
  });

  it('transmet une panne de la base au gestionnaire d erreur, sans laisser passer', async () => {
    teamModel.findByProjectId.mockRejectedValue(new Error('base injoignable'));

    const next = vi.fn();
    await isProjectMember(faireRequete(), {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
  });
});
