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

// username et city sont NOT NULL en base : le formulaire d'inscription les
// rend déjà obligatoires côté front, cette validation évite qu'un appel direct à
// l'API (sans passer par le formulaire) ne fasse remonter une erreur SQL brute.
body("username")
.notEmpty().withMessage("Pseudo obligatoire"),

body("city")
.notEmpty().withMessage("Ville obligatoire"),

// Le consentement est vérifié côté serveur et pas seulement dans le formulaire :
// une inscription envoyée sans lui doit être refusée, sinon la case n'a aucune valeur
// juridique. La date du consentement est enregistrée par le modèle.
body("consent")
.custom((value) => {
  if (value !== true && value !== 'true') {
    throw new Error("Vous devez accepter les mentions légales et la politique de confidentialité");
  }
  return true;
}),

// Le téléphone est facultatif. Quand il est fourni, on accepte aussi bien 0769461234
// que 07.69.46.12.34 : la mise au format est faite ensuite par le service, pour que la
// base ne contienne qu'une seule écriture.
body("phone")
.optional({ checkFalsy: true })
.matches(/^0[1-9]([\s.-]?\d{2}){4}$/).withMessage("Numéro invalide (ex : 07.69.46.12.34)"),
];