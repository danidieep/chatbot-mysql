const mysql =require('mysql2')

const dbConfig = {
    host: "localhost",
    user: "root",
    password: "2808",
    database: "carnave",
  };
const connection = mysql.createConnection(dbConfig);

module.exports = {connection}