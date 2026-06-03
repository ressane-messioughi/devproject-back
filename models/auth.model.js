import db from '../config/db.js';

const findByEmail = async (email) => {
  const sql = 'SELECT * FROM Users WHERE email = ?';
  const [result] = await db.execute(sql, [email]);
  return result;
};
const register = async (firstname, lastname, username, email, hashedPassword, avatar, city, phone, role) => {
  const sql =
    'INSERT INTO Users (firstname, lastname, username, email, password, avatar, city, phone, role) VALUES (?,?,?,?,?,?,?,?,?)';
  const [result] = await db.execute(sql, [
    firstname,
    lastname,
    username || "User",
    email,
    hashedPassword,
    avatar || null,
    city || null,
    phone || null,
    role || "USER",
  ]);
  return result;
};
export default {
  findByEmail,
  register,
};
