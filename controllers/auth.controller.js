import authService from '../services/auth.service.js';
import cloudinary from '../config/cloudinary.js';

// Fonction Connexion
export const login = async (req, res) => {
  const { email, password } = req.body;
  const token = await authService.loginUser({ email, password });
  return res.json(token);
};

// Fonction Inscription
export const register = async (req, res) => {
  const { firstname, lastname, username, email, password, avatar, city, phone, role } = req.body;
  const user = await authService.registerUser({
    firstname,
    lastname,
    username,
    email,
    password,
    avatar,
    city,
    phone,
    role,
  });
  return res.json(user.insertId);
};

// Fonction Mise à jour de l'utilisateur
export const updateUser = async (req, res) => {
  const id = req.user.id;
  const result = await authService.updateUser(id, req.body);
  return res.status(200).json({ message: 'Utilisateur modifié avec succès', result });
};

// Fonction Mise à jour de l'avatar
export const updateAvatar = async (req, res) => {
  const user_id = req.user.id;

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'devproject/avatar' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    stream.end(req.file.buffer);
    console.log(req.file);
  });
  const avatar = uploadResult.secure_url;
  const result = await authService.updateAvatar(user_id, avatar);
  return res.status(200).json({ message: 'Avatar mis à jour', avatar, result });
};
