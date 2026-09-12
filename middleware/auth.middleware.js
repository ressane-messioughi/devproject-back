import jwt from "jsonwebtoken"
import { COOKIE_NAME } from "./cookie.middleware.js"
import sessionModel from "../models/userSession.model.js"

export const authenticate = async (req, res, next) => {
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

let decoded;
try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
} catch {
    //Gestion d'erreur si le token est invalide ou expiré
    return res.status(401).send("Token invalide ou expiré ❌")
}

// Le jeton est authentique, mais cela ne suffit plus.
//
// Un JWT reste valable jusqu'à son expiration et rien ne peut le rappeler : c'est
// sa nature même. Tant que le serveur se contentait de vérifier la signature, un
// compte compromis restait ouvert deux heures, et le bouton de déconnexion ne
// faisait qu'effacer le cookie côté navigateur — une copie du jeton continuait
// de fonctionner.
//
// Le jeton porte donc l'identifiant de sa session, et c'est la base qui a le
// dernier mot : révoquée ou expirée, la session ferme l'accès aussitôt.
if (!decoded.sid) {
    // Jeton émis avant la mise en place des sessions. Il reste authentique, mais
    // rien ne permet plus de le révoquer : on demande une reconnexion.
    return res.status(401).send("Session expirée, reconnectez-vous 🔒")
}

let session;
try {
    session = await sessionModel.findActive(decoded.sid);
} catch (error) {
    return next(error);
}

if (!session) {
    return res.status(401).send("Session révoquée ou expirée 🔒")
}

// Trace du dernier passage, pour que le panel d'administration montre les
// sessions réellement actives. Le modèle n'écrit qu'une fois toutes les cinq
// minutes, et l'attente est inutile : si cette écriture échoue, la requête n'a
// aucune raison d'échouer avec elle.
sessionModel.toucher(decoded.sid).catch(() => {});

// Ajout des informations de l'utilisateur décodées à la requête
req.user = decoded
next();
}
