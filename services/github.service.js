import AppError from '../middleware/AppError.js';
import githubModel from "../models/github.model.js";

// Fonction pour récupérer tous les dépôts GitHub d'un projet
const getProjectRepositories = async (project_id) => {
    const result = await githubModel.findAllByProject(project_id);
return result
}
// Fonction pour créer un dépôt GitHub
const createRepository = async (name, url, branch, project_id) => {
    const result = await githubModel.create(name, url, branch, project_id);
return result 
}
// Fonction pour mettre à jour un dépôt GitHub
const updateRepository = async (id_repository, name, url, branch, project_id) => {
    const result = await githubModel.update(id_repository,name, url, branch, project_id);
    return result
}
// Fonction pour supprimer un dépôt GitHub
const deleteRepository = async (id_repository) => {
    const result = await githubModel.remove(id_repository);
    return result
}
// Fonction pour extraire "proprietaire/depot" d'une URL GitHub.
// Accepte les formes https://github.com/xxx/yyy, avec ou sans .git, avec ou sans slash final.
const extraireDepot = (url) => {
  const correspondance = String(url).match(/github\.com[/:]([^/]+)\/([^/?#]+)/);
  if (!correspondance) return null;
  return `${correspondance[1]}/${correspondance[2].replace(/\.git$/, '')}`;
};

// Fonction pour recuperer les derniers commits d'un depot via l'API GitHub.
// Le jeton est optionnel : sans lui l'API repond quand meme sur les depots publics,
// mais limite a 60 appels par heure et par adresse IP.
// En-tetes communs a tous les appels GitHub. Le jeton est optionnel : sans lui l'API
// repond quand meme sur les depots publics, mais limite a 60 appels par heure et par IP,
// et les depots prives restent inaccessibles.
const entetesGitHub = () => {
  const entetes = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) {
    entetes.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return entetes;
};

const getRepositoryCommits = async (url, branch, limite = 5) => {
  const depot = extraireDepot(url);
  if (!depot) {
    throw new AppError('URL GitHub invalide', 400);
  }

  const reponse = await fetch(
    `https://api.github.com/repos/${depot}/commits?sha=${encodeURIComponent(branch || 'main')}&per_page=${limite}`,
    { headers: entetesGitHub() },
  );

  if (reponse.status === 404) {
    throw new AppError('Dépôt ou branche introuvable sur GitHub', 404);
  }
  if (reponse.status === 403) {
    throw new AppError('Limite de requêtes GitHub atteinte, réessayez plus tard', 403);
  }
  if (!reponse.ok) {
    throw new AppError('GitHub est injoignable pour le moment', 502);
  }

  const commits = await reponse.json();

  // On ne renvoie au navigateur que ce que la page affiche, pas la reponse entiere de GitHub
  return commits.map((commit) => ({
    sha: commit.sha.slice(0, 7),
    message: commit.commit.message.split('\n')[0],
    author: commit.commit.author?.name,
    date: commit.commit.author?.date,
    url: commit.html_url,
  }));
};

// Fonction pour lister les fichiers d'un depot, a plat.
// L'API "git/trees" avec recursive=1 renvoie l'arborescence entiere en un seul appel :
// c'est ce qui permet de proposer une liste de fichiers dans le formulaire de bug sans
// interroger GitHub a chaque dossier ouvert.
const getRepositoryTree = async (url, branch) => {
  const depot = extraireDepot(url);
  if (!depot) {
    throw new AppError('URL GitHub invalide', 400);
  }

  const reponse = await fetch(
    `https://api.github.com/repos/${depot}/git/trees/${encodeURIComponent(branch || 'main')}?recursive=1`,
    { headers: entetesGitHub() },
  );

  if (reponse.status === 404) {
    throw new AppError('Dépôt ou branche introuvable sur GitHub', 404);
  }
  if (reponse.status === 403) {
    throw new AppError('Limite de requêtes GitHub atteinte, réessayez plus tard', 403);
  }
  if (!reponse.ok) {
    throw new AppError('GitHub est injoignable pour le moment', 502);
  }

  const arbre = await reponse.json();

  // "blob" designe un fichier, "tree" un dossier : on ne garde que les fichiers
  return (arbre.tree || [])
    .filter((entree) => entree.type === 'blob')
    .map((entree) => entree.path);
};

// Fonction pour verifier qu'un depot est bien accessible avec les autorisations dont on
// dispose, avant de proposer le telechargement de son archive.
const getRepositoryAccess = async (url) => {
  const depot = extraireDepot(url);
  if (!depot) {
    throw new AppError('URL GitHub invalide', 400);
  }

  const reponse = await fetch(`https://api.github.com/repos/${depot}`, {
    headers: entetesGitHub(),
  });

  if (!reponse.ok) {
    return { autorise: false, prive: null, depot };
  }

  const infos = await reponse.json();
  return {
    autorise: true,
    prive: infos.private,
    depot,
    branche_par_defaut: infos.default_branch,
    clone_url: infos.clone_url,
    ssh_url: infos.ssh_url,
  };
};

// Fonction pour recuperer l'archive ZIP d'un depot.
// Le navigateur ne sait pas cloner un depot git : telecharger l'archive est l'equivalent
// le plus proche. Elle transite par notre serveur, qui est le seul a detenir le jeton,
// ce qui permet aussi de servir les depots prives sans exposer ce jeton au navigateur.
const getRepositoryArchive = async (url, branch) => {
  const depot = extraireDepot(url);
  if (!depot) {
    throw new AppError('URL GitHub invalide', 400);
  }

  const reponse = await fetch(
    `https://api.github.com/repos/${depot}/zipball/${encodeURIComponent(branch || 'main')}`,
    { headers: entetesGitHub() },
  );

  if (reponse.status === 404) {
    throw new AppError("Dépôt introuvable, ou non autorisé avec le jeton configuré", 404);
  }
  if (!reponse.ok) {
    throw new AppError('GitHub est injoignable pour le moment', 502);
  }

  return {
    flux: reponse.body,
    nom: `${depot.split('/')[1]}-${branch || 'main'}.zip`,
  };
};

export default {
    getProjectRepositories,
    createRepository,
    updateRepository,
    deleteRepository,
    getRepositoryCommits,
    getRepositoryTree,
    getRepositoryAccess,
    getRepositoryArchive,
}