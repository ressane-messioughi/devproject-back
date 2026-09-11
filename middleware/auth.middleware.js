import jwt from "jsonwebtoken"
import { COOKIE_NAME } from "./cookie.middleware.js"

export const authenticate = (req, res, next) => {
// Le jeton arrive dans le cookie httpOnly posé à la connexion. Le navigateur le renvoie
// tout seul à chaque requête, à condition que l'appel soit fait avec credentials.
let token = req.cookies?.[COOKIE_NAME];

// Repli sur l'en-tête Authorization. Il ne sert plus à l'application, mais permet
// d'appeler l'API depuis un outil de test sans avoir à gérer les cookies.
if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        token = authHeader.split(" ")[1];
    }
}

// Vérification si le token est présent et valide
if (!token) {
    return res.status(401).send("Accès refusé 🔒")
}
// Vérification si le token est présent et valide
jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

//Gestion d'erreur si le token est invalide ou expiré
if (err) {
    return res.status(401).send("Token invalide ou expiré ❌")
}
// Ajout des informations de l'utilisateur décodées à la requête
req.user = decoded
next();
})
}
