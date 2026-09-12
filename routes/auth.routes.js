    import express from 'express';
    import {authenticate} from '../middleware/auth.middleware.js'
    import upload from '../middleware/upload.middleware.js';
    import validate from '../middleware/validate.js';
    import {
      validateAuthBody,
      validateRegisterBody,
      validateEmailBody,
      validateJetonBody,
      validateResetBody,
    } from '../validators/auth.validator.js';

    import { authLimiter } from '../middleware/rateLimit.middleware.js';

    import {
      updateUser,
      login,
      register,
      updateAvatar,
      logout,
      me,
      confirmEmail,
      resendConfirmation,
      forgotPassword,
      resetPassword,
    } from '../controllers/auth.controller.js';

    const router = express.Router();

    // Route pour l'inscription d'un nouvel utilisateur
    router.post('/register', authLimiter, validateRegisterBody, validate, register);

    // Route pour la connexion d'un utilisateur
    // authLimiter compte les échecs : dix par adresse IP sur quinze minutes
    router.post('/login', authLimiter, validateAuthBody, validate, login);

    // Route pour la déconnexion : seul le serveur peut retirer un cookie httpOnly
    router.post('/logout', logout);

    // Route qui indique qui est connecté, ou que personne ne l'est.
    // Sans authenticate : elle doit pouvoir répondre "personne" en 200, y compris
    // depuis une page publique. Le jeton est vérifié dans le contrôleur.
    router.get('/me', me);

    // Confirmation de l'adresse, depuis le lien reçu par email
    router.post('/email/confirm', validateJetonBody, validate, confirmEmail);

    // Renvoi du lien de confirmation.
    // authLimiter est indispensable ici : sans lui, cette route permet d'envoyer
    // autant d'emails qu'on veut à l'adresse de quelqu'un d'autre.
    router.post('/email/resend', authLimiter, validateEmailBody, validate, resendConfirmation);

    // Mot de passe oublié : demande du lien, puis choix du nouveau mot de passe
    router.post('/password/forgot', authLimiter, validateEmailBody, validate, forgotPassword);
    router.post('/password/reset', authLimiter, validateResetBody, validate, resetPassword);

    // Route pour mettre à jour les informations d'un utilisateur
    router.patch('/:id', authenticate, updateUser);

    // Route pour mettre à jour l'avatar d'un utilisateur
    router.put("/me/avatar", authenticate,upload.single("avatar"),updateAvatar);

    export default router;
