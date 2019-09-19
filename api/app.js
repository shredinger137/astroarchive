const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'gtn',
  password: '',
  database: 'gortarchive'
});
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});