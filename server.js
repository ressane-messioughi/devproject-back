import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoute from './routes/auth.routes.js';
import projectRoute from './routes/project.routes.js';
import journalRoute from './routes/journal.routes.js';
import teamRoute from './routes/team.routes.js';
import taskRoute from './routes/task.routes.js';
import sprintRoute from './routes/sprint.routes.js';
import githubRoute from './routes/github.routes.js';
import bugRoute from './routes/bug.routes.js';
import schemaRoute from './routes/schema.routes.js';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import configureSocket from './socket/index.js';

const app = express();
// Création d'une instance de serveur HTTP
const server = createServer(app);
// Création d'une instance de Socket.IO contenant le serveur HTTP + configuration CORS
const originesAutorisees = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:8080'];

export const io = new Server(server, {
  cors: {
    origin: originesAutorisees,
    methods: ['GET', 'POST'],
  },
});

// Ajout de l'instance de Socket.IO à l'application Express
app.set("io", io);
// Configuration des événements Socket.IO
configureSocket(io);

const PORT = process.env.PORT || 3000;

app.use(cors({ origin: originesAutorisees }));

app.use(express.json());

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
app.use('/api/project/:id_project/github', githubRoute);
app.use('/api/project/:id_project/team', teamRoute);

// Middleware d'erreur global — doit rester le tout dernier app.use().
// Sans lui, une AppError levée dans un service retombe sur le gestionnaire
// par défaut d'Express, qui ignore statusCode et renvoie du HTML au lieu de JSON.
app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({ message: err.message || 'Erreur serveur' });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Backend running on http://localhost:${PORT} ✅`);
});
