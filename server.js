import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import authRoute from './routes/auth.routes.js';
import projectRoute from './routes/project.routes.js';
import journalRoute from './routes/journal.routes.js';
import teamRoute from './routes/team.routes.js';
import taskRoute from './routes/task.routes.js';
import sprintRoute from './routes/sprint.routes.js';
import githubRoute from './routes/github.routes.js';
import bugRoute from './routes/bug.routes.js';
import schemaRoute from './routes/schema.routes.js';
import documentRoute from './routes/document.routes.js';
import dailyRoute from './routes/daily.routes.js';
import adminRoute from './routes/admin.routes.js';
import ticketRoute from './routes/ticket.routes.js';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import configureSocket from './socket/index.js';

const app = express();
// Création d'une instance de serveur HTTP
const server = createServer(app);
// Création d'une instance de Socket.IO contenant le serveur HTTP + configuration CORS
const originesAutorisees = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : [
      'http://localhost:5173',
      'http://localhost:5174',
      // Port par défaut de "vite preview", utilisé pour tester le build de production
      // en local : sans lui, l'API refuse les requêtes et la console se remplit d'erreurs.
      'http://localhost:4173',
      'http://localhost:8080',
    ];

export const io = new Server(server, {
  cors: {
    origin: originesAutorisees,
    methods: ['GET', 'POST'],
    // Sans credentials, le navigateur n'envoie pas le cookie de session au handshake
    credentials: true,
  },
});

// Ajout de l'instance de Socket.IO à l'application Express
app.set("io", io);
// Configuration des événements Socket.IO
configureSocket(io);

const PORT = process.env.PORT || 3000;

// En-têtes de sécurité HTTP : type MIME non deviné, page non affichable dans une iframe
// d'un autre site, référent limité, HSTS en production.
// La politique de contenu est écrite à la main : celle de helmet interdit par défaut
// les images d'un autre domaine, ce qui bloquerait Cloudinary.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        connectSrc: ["'self'", ...originesAutorisees],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// credentials: true est indispensable depuis le passage au cookie : sans lui le
// navigateur refuse d'envoyer le cookie de session sur une requête vers un autre port.
app.use(cors({ origin: originesAutorisees, credentials: true }));

app.use(express.json());

// Remplit req.cookies, sur lequel s'appuie le middleware d'authentification
app.use(cookieParser());

// Limiteur général, posé avant les routes
app.use('/api', apiLimiter);

// Middleware pour logger les requêtes HTTP avec morgan en utilisant le format "combined" pour inclure des informations détaillées sur chaque requête.
app.use(morgan('combined'));


// ROUTES ICI
app.use('/api/auth', authRoute);
app.use('/api/project', projectRoute);
app.use('/api/project/:id_project/journal', journalRoute);
app.use('/api/project/:id_project/task', taskRoute);
app.use('/api/project/:id_project/bug', bugRoute);
app.use('/api/project/:id_project/sprint', sprintRoute);
app.use('/api/project/:id_project/schema', schemaRoute);
app.use('/api/project/:id_project/document', documentRoute);
app.use('/api/project/:id_project/daily', dailyRoute);
app.use('/api/project/:id_project/github', githubRoute);
app.use('/api/project/:id_project/team', teamRoute);
app.use('/api/support', ticketRoute);
app.use('/api/admin', adminRoute);

// Middleware d'erreur global — doit rester le tout dernier app.use().
// Sans lui, une AppError levée dans un service retombe sur le gestionnaire
// par défaut d'Express, qui ignore statusCode et renvoie du HTML au lieu de JSON.
//
// Le quatrième paramètre est obligatoire même inutilisé : Express reconnaît un
// middleware d'erreur au nombre d'arguments de la fonction, pas à leur nom. Le
// retirer ferait de celui-ci un middleware ordinaire, plus jamais appelé sur une
// erreur. Le préfixe _ dit à ESLint que l'oubli est volontaire.
app.use((err, req, res, _next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({ message: err.message || 'Erreur serveur' });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Backend running on http://localhost:${PORT} ✅`);
});
