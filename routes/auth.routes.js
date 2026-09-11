    import express from 'express';
    import {authenticate} from '../middleware/auth.middleware.js'
    import upload from '../middleware/upload.middleware.js';
    import validate from '../middleware/validate.js';
    import { validateAuthBody, validateRegisterBody } from '../validators/auth.validator.js';

    import { authLimiter } from '../middleware/rateLimit.middleware.js';

    import { updateUser , login, register, updateAvatar, logout, me } from '../controllers/auth.controller.js';

    const router = express.Router();

    // Route pour l'inscription d'un nouvel utilisateur
    router.post('/register', authLimiter, validateRegisterBody, validate, register);

    // Route pour la connexion d'un utilisateur
    // authLimiter compte les échecs : dix par adresse IP sur quinze minutes
    router.post('/login', authLimiter, validateAuthBody, validate, login);

    // Route pour la déconnexion : seul le serveur peut retirer un cookie httpOnly
    router.post('/logout', logout);

    // Route qui indique qui est connecté.
    // Elle remplace le décodage du jeton dans le navigateur, qui n'y a plus accès.
    router.get('/me', authenticate, me);

    // Route pour mettre à jour les informations d'un utilisateur
    router.patch('/:id', authenticate, updateUser);

    // Route pour mettre à jour l'avatar d'un utilisateur
    router.put("/me/avatar", authenticate,upload.single("avatar"),updateAvatar);

    export default router;
