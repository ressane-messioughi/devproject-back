import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Création d'un pool de connexions à la base de données MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});


export default db;
