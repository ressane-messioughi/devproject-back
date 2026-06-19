import jwt from "jsonwebtoken"

export const authenticate = (req, res, next) => {
const authHeader = req.headers.authorization;

if (!authHeader) {
    return res.status(401).send("Accès refusé 🔒")
}
const token = authHeader.split(" ")[1];

jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
if (err) {
    return res.status(403).send("Token invalide ou expiré ❌")
}
req.user = decoded
console.log(req.user)
next();
})
}
