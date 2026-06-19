import authModel from "../models/auth.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import AppError from "../middleware/appError.js"

const loginUser = async ({email, password}) => {
    const user = await authModel.findByEmail(email);
    if (user.length === 0) {
        throw new AppError ("Utilisateurs non trouvé")
    };

    const users = user[0];

    const isPasswordIsValid = await bcrypt.compare(password, users.password)
  if (!isPasswordIsValid) {
    throw new AppError ("Email ou mots de passe invalide ❌", 400 )
  }
  const token = jwt.sign({
    id: users.id, username: users.username, firstname: users.firstname, lastname: users.lastname, role: users.role, avatar: users.avatar, email: users.email, createdAt: users.created_at},
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
const updateUser = async (id, userData) => {
  const fields = [];
  const values = [];

  if (userData.username !== undefined) {
    fields.push("username = ?");
    values.push(userData.username);
  }

  if (userData.firstname !== undefined) {
    fields.push("firstname = ?");
    values.push(userData.firstname);
  }

  if (userData.lastname !== undefined) {
    fields.push("lastname = ?");
    values.push(userData.lastname);
  }

  if (userData.email !== undefined) {
    fields.push("email = ?");
    values.push(userData.email);
  }

  if (userData.avatar !== undefined) {
    fields.push("avatar = ?");
    values.push(userData.avatar);
  }

  if (userData.city !== undefined) {
    fields.push("city = ?");
    values.push(userData.city);
  }

  if (userData.phone !== undefined) {
    fields.push("phone = ?");
    values.push(userData.phone);
  }

  if (fields.length === 0) {
    return { message: "Rien à modifier" };
  }

  const sql = `UPDATE Users SET ${fields.join(", ")} WHERE id = ?`;

  values.push(id);

  return await authModel.update(sql, values);
};



export default {
    loginUser,
    registerUser,
    updateUser

} 