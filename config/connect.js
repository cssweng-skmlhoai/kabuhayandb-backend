import mysql from 'mysql2/promise';
import { setTimeout as sleep } from 'timers/promises';
import 'dotenv/config';

let pool = null;

export const initDB = async () => {
  if (pool) return pool;

  console.log('Initializing database...');

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    ssl: {
      rejectUnauthorized: true,
    },
  });

  let connected = false;
  let retries = 5;
  let lastError = null;

  while (retries > 0 && !connected) {
    try {
      const connection = await pool.getConnection();
      console.log(`Connected to database: ${process.env.DB_DATABASE}`);
      connection.release();
      connected = true;
    } catch (error) {
      lastError = error;
      retries--;

      if (retries > 0) {
        const delay = Math.pow(2, 5 - retries) * 1000;
        console.log(
          `Failed to connect to database. Retrying in ${delay / 1000}s... (${retries} attempts left)`
        );
        await sleep(delay);
      }
    }
  }

  if (!connected) {
    console.error(
      'Failed to connect to database after multiple attempts:',
      lastError
    );
    throw lastError;
  }

  return pool;
};

export const getDB = async () => {
  if (!pool) {
    return initDB();
  }

  return pool;
};

export const closeDB = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database connection closed.');
  }
};

export default pool;
