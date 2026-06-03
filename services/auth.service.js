import authModel from "../models/auth.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import AppError from "../middleware/AppError.js"

const loginUser = async ({email, password}) => {
    const user = await authModel.findByEmail(email);
    if (user.length === 0) {
        throw new AppError ("Utilisateurs non trouvé")
    };

    const users = user[0];

    const isPasswordIsValid = await bcrypt.compare(password, users.password)
  if (!isPasswordIsValid) {
    throw new AppError ("Email ou mots de passe invalide ❌")
  }
  const token = jwt.sign({
    id: users.id, firstname: users.firstname, lastname: users.lastname, role: users.role, avatar: users.avatar},
    process.env.JWT_SECRET,
    {expiresIn: "1h"}
  ) 
  return {token};
}
const registerUser = async ({firstname, lastname, username, email, password, avatar, city, phone, role}) => {
    const existingUser = await authModel.findByEmail(email)
    if (existingUser.length > 0) {
        throw new AppError ("❌ Email déjà utilisé ❌")
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await authModel.register(firstname, lastname, username, email, hashedPassword, avatar, city, phone, role);
    return result
}


export default {
    loginUser,
    registerUser

} 