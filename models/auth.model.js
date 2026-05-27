import db from '../config/db.js';

const findByEmail = async (email) => {
  const sql = 'SELECT * FROM users WHERE email = ?';
  const result = await db.execute(sql, [email]);
  return result;
};
const register = async ({ firstname, lastname, email, password, birthday, city, phone }) => {
  const sql =
    'INSERT INTO users (firstname,lastname,email,password,birthday,city,phone) VALUES (?,?,?,?,?,?,?)';
  const result = await db.execute(sql, [
    firstname,
    lastname,
    email,
    password,
    birthday,
    city,
    phone,
  ]);
  return result;
};
export default {
  findByEmail,
  register,
};
