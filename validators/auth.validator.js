import { body } from "express-validator";

export const validateAuthBody = [
body("email")
.isEmail()
.notEmpty().withMessage("Email obligatoire"),

body("password")
.notEmpty().withMessage("Mots de passe obligatoire"),
];