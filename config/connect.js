import mysql from 'mysql2/promise';

const pool = mysql.createPool({ // FUTURE: put this all in a .env file for security purposes
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  user: '3kFNHppaS7n6CoU.root',
  password: 'nQsP65GDdD7yh1Hj',
  database: 'kabuhayan_db',
  port: 4000,
  ssl: {
    rejectUnauthorized: true
  }
});

export default pool;