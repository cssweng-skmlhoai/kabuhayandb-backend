import mysql from 'mysql2/promise';

const pool = mysql.createPool({ // FUTURE: put this all in a .env file for security purposes
  host: 'insert host here',
  user: 'insert user here',
  password: 'insert password here',
  database: 'insert db name here',
  port: 4000,
  ssl: {
    rejectUnauthorized: true
  }
});

export default pool;