<div align="center">

# DevProject — API

**Le serveur de DevProject : l'API REST, le temps réel et la base de données.**

[![Node](https://img.shields.io/badge/Node-22-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io)
[![JWT](https://img.shields.io/badge/JWT-auth-D63AFF?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

<a href="#démarrage-rapide">🚀 Démarrage rapide</a> ·
<a href="#larchitecture-en-quatre-couches">Architecture</a> ·
<a href="#les-routes">Routes</a> ·
<a href="#la-sécurité">Sécurité</a> ·
<a href="#le-temps-réel">Temps réel</a> ·
<a href="https://github.com/ressane-messioughi/devproject-front">Interface</a>

</div>

---

## Démarrage rapide

L'orchestrateur Docker vit dans le [dépôt de l'interface](https://github.com/ressane-messioughi/devproject-front) :
il construit les trois conteneurs, celui-ci compris. **C'est le chemin le plus
court**, il ne demande ni Node ni MySQL installés.

```bash
git clone https://github.com/ressane-messioughi/devproject-front.git DPJ-Frontend
git clone https://github.com/ressane-messioughi/devproject-back.git  DPJ-Backend

cd DPJ-Frontend
cp .env.example .env      # renseigner DB_PASSWORD et JWT_SECRET
docker compose up -d --build
```

L'API répond alors sur **http://localhost:3000/api** et l'interface sur
**http://localhost:8080**.

<details>
<summary><b>Démarrer l'API seule, sans Docker</b></summary>

<br>

Il vous faut **Node 20 ou plus** et un serveur **MySQL** accessible.

```bash
git clone https://github.com/ressane-messioughi/devproject-back.git
cd devproject-back
npm install
cp .env.example .env
npm run dev
```

| Variable | À quoi ça sert |
|---|---|
| `DB_HOST` `DB_PORT` `DB_USER` `DB_PASSWORD` `DB_NAME` | La connexion MySQL |
| `JWT_SECRET` | La clé qui signe les jetons. **Une longue chaîne aléatoire** — c'est elle qui empêche de fabriquer un faux jeton |
| `CLOUDINARY_*` | L'hébergement des photos de profil. Vides, l'API démarre : seul l'upload d'avatar est indisponible |
| `CORS_ORIGIN` | Les origines autorisées, séparées par des virgules. Absente, trois adresses locales sont acceptées |

Le schéma de la base se trouve dans le dépôt de l'interface :
`docker/init/01-schema.sql`.

| Commande | Effet |
|---|---|
| `npm run dev` | Démarrage avec `nodemon`, redémarrage à chaque modification |
| `npm start` | Démarrage simple |
| `npm test` | La suite Vitest |
| `npm run format` | Prettier sur tout le projet |

</details>

---

## Ce que fait cette API

Elle sert l'interface React de DevProject, et rien d'autre. Elle gère les
comptes et leur authentification, les projets et leurs équipes, le journal de
bord, le suivi des bugs, les sprints et les tâches — et elle pousse en temps
réel tout ce que les autres membres doivent voir sans recharger leur page.

Deux choix structurent tout le reste.

**Pas d'ORM.** Les requêtes SQL sont écrites à la main avec `mysql2`, en
requêtes préparées. C'était volontaire : je voulais comprendre mes jointures
avant de laisser une bibliothèque les écrire à ma place. Ça m'a coûté du temps
sur les requêtes complexes, et c'est exactement pour ça que je l'ai fait.

**Une seule responsabilité par fichier.** Une route ne fait que router, un
contrôleur ne fait que traduire HTTP, un service porte la règle métier, un
modèle parle à la base. C'est détaillé juste en dessous.

---

## L'architecture en quatre couches

Chaque requête traverse les mêmes étages, toujours dans le même ordre. Aucune
couche n'en saute une autre.

```
Requête HTTP
     │
     ▼
┌──────────────┐  routes/       Quelle URL, quelle méthode, quels middlewares.
│   ROUTES     │                Aucune logique : que du branchement.
└──────┬───────┘
       ▼
┌──────────────┐  controllers/  Lit req, appelle un service, renvoie une
│ CONTRÔLEURS  │                réponse et un code HTTP. Ne touche jamais au SQL.
└──────┬───────┘
       ▼
┌──────────────┐  services/     La règle métier. C'est ici qu'on décide
│   SERVICES   │                qu'un projet crée aussi son équipe.
└──────┬───────┘                Ne connaît ni req ni res.
       ▼
┌──────────────┐  models/       Les requêtes SQL préparées. Rien d'autre.
│   MODÈLES    │
└──────┬───────┘
       ▼
    MySQL
```

L'exemple le plus parlant est la création d'un projet. Le contrôleur ne sait
pas qu'une équipe est créée au passage — c'est une règle métier, elle vit dans
le service :

```js
const createProject = async (name, description, owner_id, trello_url) => {
    const team_code = generateTeamCode();
    const project = await projectModel.create(name, description, owner_id, team_code, trello_url)
      const project_id = project.insertId;
      const team = await teamModel.create(`Team ${name}`, project_id)
        await teamModel.addUserToTeam(owner_id, team.insertId, "OWNER")
    return project
}
```

Un projet, son équipe, et son créateur inscrit comme propriétaire : trois
écritures pour une seule intention. **Si cette logique vivait dans le
contrôleur, elle serait à réécrire le jour où un projet se crée autrement.**

---

## Les routes

Toutes les routes sont préfixées par `/api`. Sauf `register` et `login`,
**toutes exigent un jeton valide**.

| Ressource | Préfixe | Routes |
|---|---|---|
| **Authentification** | `/auth` | `POST /register` · `POST /login` · `PATCH /:id` · `PUT /me/avatar` |
| **Projets** | `/project` | `GET /` · `GET /my-project` · `GET /:id_project` · `POST /` · `PUT /:id_project` · `DELETE /:id_project` |
| **Demandes d'adhésion** | `/project` | `POST /join` · `GET /:id_project/requests` · `PUT /:id_project/requests/:id_request/accept` · `PUT …/refuse` |
| **Équipe** | `/project/:id_project/team` | `GET /` · `PATCH /:users_id/role` · `DELETE /:users_id/member` · `DELETE /:team_id` |
| **Journal** | `/project/:id_project/journal` | `GET /` · `POST /` · `PUT /:id_journal` · `DELETE /:id_journal` |
| **Bugs** | `/project/:id_project/bug` | `GET /` · `POST /` · `PUT /:id_bug` · `PATCH /:id_bug/status` · `DELETE /:id_bug` |
| **Sprints** | `/project/:id_project/sprint` | `GET /` · `POST /` · `PUT /:id_sprint` · `DELETE /:id_sprint` |
| **Tâches** | `/project/:id_project/task` | `GET /` · `POST /` · `PUT /:id_task` · `DELETE /:id_task` |
| **Dépôts GitHub** | `/project/:id_project/github` | `GET /` · `POST /` · `PUT /:id_repository` · `DELETE /:id_repository` |

L'imbrication n'est pas décorative : `/project/:id_project/journal` dit que le
journal **n'existe pas sans son projet**. L'URL porte la relation.

> Les routes de tâches et de sprints sont opérationnelles côté serveur, mais
> l'interface correspondante n'a pas été construite. C'est un arbitrage assumé,
> détaillé dans le README de l'interface.

---

## La sécurité

**Les mots de passe ne sont jamais stockés en clair.** `bcrypt` les transforme
en empreinte à l'inscription, et la connexion compare deux empreintes sans
jamais reconstituer le mot de passe d'origine.

**Les règles du cahier des charges sont appliquées à l'inscription** — huit
caractères, une majuscule, un chiffre, un caractère spécial :

```js
body("password")
.isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caractères")
.matches(/[A-Z]/).withMessage("Le mot de passe doit contenir au moins une majuscule")
.matches(/[0-9]/).withMessage("Le mot de passe doit contenir au moins un chiffre")
.matches(/[^A-Za-z0-9]/).withMessage("Le mot de passe doit contenir au moins un caractère spécial"),
```

La connexion, elle, ne vérifie que la présence du champ. C'est délibéré :
durcir la validation là empêcherait les comptes existants de se connecter, et
révélerait la règle à quelqu'un qui teste des identifiants.

**Aucune requête n'est construite par concaténation.** Toutes passent par des
requêtes préparées, où la valeur est envoyée séparément de la requête :

```js
const sql = 'INSERT INTO project (name,description,owner_id,team_code,trello_url) VALUES (?,?,?,?,?)';
```

C'est ce qui rend l'injection SQL impossible : le `?` ne peut recevoir qu'une
donnée, jamais une instruction.

**La validation est centralisée.** Sept fichiers de `validators/` décrivent les
règles par domaine, et un seul middleware les applique :

```js
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
```

**Les fichiers envoyés ne touchent jamais le disque du serveur.** `multer` les
reçoit en mémoire et `cloudinary` les héberge : rien d'exécutable n'atterrit
sur la machine.

**Deux niveaux d'autorisation.** `authenticate` vérifie le jeton et renseigne
`req.user`. `isProjectOwner` va plus loin et interroge la base pour confirmer
que l'utilisateur est bien propriétaire du projet, avant toute suppression ou
validation d'adhésion.

---

## Le temps réel

Socket.IO partage le serveur HTTP d'Express, donc le même port. Les connexions
sont regroupées en **salles** : une par projet, et une par utilisateur.

```js
socket.to(room).emit(…)   // toute la salle sauf l'émetteur
io.to(room).emit(…)       // toute la salle, émetteur compris
```

La distinction porte toute la logique. Quand un membre rejoint un projet,
`socket.to` annonce son arrivée aux autres — lui n'a pas besoin d'apprendre
qu'il vient d'arriver. Puis `io.to` rediffuse la liste complète des présents,
que **tout le monde** doit recevoir à jour, le nouveau venu le premier.

La salle personnelle `user_<id>` m'a semblé superflue au début, jusqu'à un cas
concret : quand un propriétaire accepte une demande d'adhésion, le demandeur
n'est encore dans aucune salle de projet. Sans casier personnel, impossible de
le prévenir.

La liste des membres connectés vit dans un objet en mémoire. C'est volontaire :
la présence n'a de sens que pendant l'exécution, l'écrire en base serait à la
fois inutile et coûteux.

---

## Les tests

```bash
npm test
```

**3 tests, sur le middleware d'authentification** — la porte d'entrée de toute
l'API : si elle cède, tout le reste cède avec elle.

| Cas vérifié | Attendu |
|---|---|
| L'en-tête `Authorization` est absent | `401` |
| Le jeton est invalide | `401` |
| Le jeton est valide | `next()` est appelé et `req.user` est renseigné |

La couverture est étroite et je l'assume : j'ai préféré trois tests qui portent
sur le chemin critique plutôt qu'une série de tests décoratifs sur des
fonctions sans risque.

---

## Comment c'est organisé

```
├── server.js          Point d'entrée : Express, Socket.IO, CORS, gestion d'erreurs
├── config/            Connexion MySQL et configuration Cloudinary
├── routes/            9 fichiers — le branchement des URL
├── controllers/       10 fichiers — la traduction HTTP
├── services/          11 fichiers — la règle métier
├── models/            10 fichiers — les requêtes SQL préparées
├── validators/        7 fichiers — les règles de validation par domaine
├── middleware/        authenticate · isProjectOwner · validate · upload · AppError
└── socket/            La configuration Socket.IO et les événements de salle
```

Le middleware d'erreur est **le tout dernier `app.use()` de `server.js`**, et
ce n'est pas un détail : sans lui, une erreur levée dans un service retombe sur
le gestionnaire par défaut d'Express, qui ignore le code de statut et renvoie
du HTML là où le front attend du JSON.

---

## Ce que je n'ai pas fait

Autant le dire moi-même plutôt que d'attendre qu'on le trouve.

**Les routes de lecture ne revérifient pas l'appartenance à l'équipe.** Seules
les actions réservées au propriétaire passent par `isProjectOwner`. Un membre
retiré d'un projet ne verra plus rien dans l'interface, mais l'API répondrait
encore à une requête directe. C'est la faille que je corrigerais en premier.

**Les événements Socket.IO ne sont pas authentifiés.** Aucun jeton n'est
transmis à l'ouverture de la connexion, et l'entrée dans une salle n'est pas
contrôlée. La correction passerait par un middleware `io.use()` validant le JWT
au moment du handshake.

**La configuration ESLint est commentée.** `npm run lint` s'exécute donc sur une
configuration vide et ne vérifie rien. Prettier, lui, fonctionne.

**La récupération de mot de passe n'existe pas.** Elle demandait un service
d'envoi d'e-mails, écarté du périmètre de la première version.

---

<div align="center">
<br>
<sub>Ressane Messioughi — projet de fin de formation, titre professionnel DWWM</sub>
</div>
