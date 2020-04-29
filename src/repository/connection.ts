import mysql from "mysql2/promise";
import dbConfig from "../../db/db-config.json";

const pool = mysql.createPool(dbConfig);

export default pool;
