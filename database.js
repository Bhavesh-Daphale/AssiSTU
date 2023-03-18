var mysql = require('mysql');

var connection = mysql.createConnection({
    host:'localhost',
    database:'assistu_db',
    user:'root',
    password:'root123'
});

module.exports = connection;