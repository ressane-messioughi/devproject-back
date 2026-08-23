    import express from 'express';
    import {authenticate} from '../middleware/auth.middleware.js'
    import upload from '../middleware/upload.middleware.js';
    import validate from '../middleware/validate.js';
    import { validateAuthBody, validateRegisterBody } from '../validators/auth.validator.js';

    import { updateUser , login, register, updateAvatar } from '../controllers/auth.controller.js';

    const router = express.Router();

    // Route pour l'inscription d'un nouvel utilisateur
    router.post('/register', validateRegisterBody, validate, register);

    // Route pour la connexion d'un utilisateur
    router.post('/login', validateAuthBody, validate, login);

    // Route pour mettre à jour les informations d'un utilisateur
    router.patch('/:id', authenticate, updateUser);

    // Route pour mettre à jour l'avatar d'un utilisateur
    router.put("/me/avatar", authenticate,upload.single("avatar"),updateAvatar);

    export default router;
