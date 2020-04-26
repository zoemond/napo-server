import mysql from 'mysql2';
const dbConfig = require('../../db/db-config.json');

const connection = mysql.createConnection(dbConfig);

export default connection;
