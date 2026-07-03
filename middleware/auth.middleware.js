import jwt from "jsonwebtoken"

export const authenticate = (req, res, next) => {
    // Récupération de l'en-tête d'autorisation
const authHeader = req.headers.authorization;
// Vérification si l'en-tête d'autorisation est présent
if (!authHeader) {
    return res.status(401).send("Accès refusé 🔒")
}
// Suppression des espaces blancs autour du token
const token = authHeader.split(" ")[1];

// Vérification si le token est présent et valide
if (!token) {
    return res.status(401).send("Accès refusé 🔒")
}
// Vérification si le token est présent et valide
jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

//Gestion d'erreur si le token est invalide ou expiré
if (err) {
    return res.status(403).send("Token invalide ou expiré ❌")
}
// Ajout des informations de l'utilisateur décodées à la requête
req.user = decoded
next();
})
}
