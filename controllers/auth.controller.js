import authService from "../services/auth.service.js"

export const login = async (req, res) => {
    const {email, password} = req.body
    const token = await authService.loginUser({email, password})
    return res.json(token)
} 
export const register = async (req, res) => {
    const {firstname, lastname, username, email, password, avatar, city, phone, role} = req.body
    const user = await authService.registerUser({firstname, lastname, username, email, password, avatar, city, phone, role})
    return res.json(user.insertId)
}
export const updateUser = async (req, res) => {
  const id = req.user.id;

  const result = await authService.updateUser(id, req.body);

  return res.status(200).json({
    message: "Utilisateur modifié avec succès",
    result,
  });
};