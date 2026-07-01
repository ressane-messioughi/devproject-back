    import express from 'express';
    import {authenticate} from '../middleware/auth.middleware.js'
    import upload from '../middleware/upload.middleware.js';

    import { updateUser , login, register, updateAvatar } from '../controllers/auth.controller.js';

    const router = express.Router();

    // Route pour l'inscription d'un nouvel utilisateur
    router.post('/register', register);

    // Route pour la connexion d'un utilisateur
    router.post('/login', login);

    // Route pour mettre à jour les informations d'un utilisateur
    router.patch('/:id', authenticate, updateUser);

    // Route pour mettre à jour l'avatar d'un utilisateur
    router.put("/me/avatar", authenticate,upload.single("avatar"),updateAvatar);

    export default router;
