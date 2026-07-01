import authModel from "../models/auth.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import AppError from "../middleware/appError.js"

// Fonction pour connecter un utilisateur
const loginUser = async ({email, password}) => {
    const user = await authModel.findByEmail(email);
    if (user.length === 0) {
        throw new AppError ("Utilisateurs non trouvé")
    };

    const users = user[0];
// Vérification du password saisie avec le password HASH stocké dans la base donnée.
    const isPasswordIsValid = await bcrypt.compare(password, users.password)
  if (!isPasswordIsValid) {
    throw new AppError ("Email ou mots de passe invalide ❌", 400 )
  }
  // Assignation d'un TOKEN à la connection contenant les informations de l'utilisateur pour une durée de validité de 2 Heures 
  const token = jwt.sign({
    id: users.id, username: users.username, firstname: users.firstname, lastname: users.lastname, role: users.role, avatar: users.avatar, email: users.email, createdAt: users.created_at, phone: users.phone},
    process.env.JWT_SECRET,
    {expiresIn: "2h"}
  ) 
  return {token};
}
// Fonction pour enregistrer un nouvel utilisateur
const registerUser = async ({firstname, lastname, username, email, password, avatar, city, phone, role}) => {
  // Vérification si l'email est saisie est déjà contenu dans la base de donnée / logique (1 compte = 1 adresse mail)
  const existingUser = await authModel.findByEmail(email)
    if (existingUser.length > 0) {
        throw new AppError ("❌ Email déjà utilisé ❌")
    }
  // Hashage du Password saisie à l'enregistrement
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await authModel.register(firstname, lastname, username, email, hashedPassword, avatar, city, phone, role);
    return result
}

// Fonction pour mettre à jour les informations d'un utilisateur
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

  const [result] = await authModel.update(sql, values);

  const user = await authModel.findById(id);

// Assignation d'un nouveau TOKEN à la modification des informations de l'utilisateur contenant les nouvelles informations de l'utilisateur.
  const token = jwt.sign(
    {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      city: user.city,
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  return {
    message: "Utilisateur modifié avec succès",
    result,
    user,
    token,
  };
};
// Fonction pour mettre à jour l'avatar d'un utilisateur
const updateAvatar = async (user_id, avatar) => {
const result = await authModel.updateAvatar(user_id, avatar);
return result

}



export default {
    loginUser,
    registerUser,
    updateUser,
    updateAvatar

} 