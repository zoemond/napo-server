import mysql from 'mysql2';
const dbConfig = require('../../db/db-config.json');

const pool = mysql.createPool(dbConfig);

export default pool;
