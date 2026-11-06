const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "escola", // Senha já configurada
    database: "2dsb"     // Nome do banco alterado para '2dsb'
});

module.exports = { pool };
