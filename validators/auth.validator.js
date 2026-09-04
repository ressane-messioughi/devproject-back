import { body } from "express-validator";

export const validateAuthBody = [
body("email")
.isEmail().withMessage("Email invalide")
.notEmpty().withMessage("Email obligatoire"),

body("password")
.notEmpty().withMessage("Mots de passe obligatoire"),
];

export const validateRegisterBody = [
body("email")
.isEmail().withMessage("Email invalide")
.notEmpty().withMessage("Email obligatoire"),

body("password")
.isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caractères")
.matches(/[A-Z]/).withMessage("Le mot de passe doit contenir au moins une majuscule")
.matches(/[0-9]/).withMessage("Le mot de passe doit contenir au moins un chiffre")
.matches(/[^A-Za-z0-9]/).withMessage("Le mot de passe doit contenir au moins un caractère spécial"),

body("firstname")
.notEmpty().withMessage("Prénom obligatoire"),

body("lastname")
.notEmpty().withMessage("Nom obligatoire"),
];