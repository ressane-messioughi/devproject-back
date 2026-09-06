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

// username, city et phone sont NOT NULL en base : le formulaire d'inscription les
// rend déjà obligatoires côté front, cette validation évite qu'un appel direct à
// l'API (sans passer par le formulaire) ne fasse remonter une erreur SQL brute.
body("username")
.notEmpty().withMessage("Pseudo obligatoire"),

body("city")
.notEmpty().withMessage("Ville obligatoire"),

body("phone")
.notEmpty().withMessage("Numéro de téléphone obligatoire")
.matches(/^0[1-9](\.\d{2}){4}$/).withMessage("Format attendu : 07.69.46.12.34"),
];