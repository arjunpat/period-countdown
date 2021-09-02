const mysql = require('mysql');
const fs = require('fs');

class MySQL {

  constructor(user, password, database, host) {
    this.conn = mysql.createPool({
      user,
      password,
      database,
      host
    });
  }

  init(sql) {
    sql = sql.split(';');

    for (let i = 0; i < sql.length; i++) {
      if (!sql[i].trim())
        continue;

      this.query(sql[i], []).then(val => {
        // console.log(val)
      }).catch(err => {
        console.log(err);
        process.exit(1);
      });
    }
  }

  query(sql, vals) {
    return new Promise((resolve, reject) => {
      this.conn.query(sql, vals, (err, res) => {
        if (err)
          reject(err);

        resolve(res);
      });
    });
  }

  insert(table, obj) {
    let values = [];
    let questions = '';
    let keys = '';
    
    for (let key in obj) {
      keys += key + ', ';
      questions += '?, ';
      values.push(obj[key]);
    }

    keys = keys.substring(0, keys.length - 2);
    questions = questions.substring(0, questions.length - 2);

    return this.query(`INSERT INTO ${table} (${keys}) VALUES (${questions})`, values);
  }

  update(table, set, where) {
    let values = [];
    let setString = '';
    let whereString = '';

    for (let key in set) {
      setString += `${key} = ?, `;
      values.push(set[key]);
    }

    for (let key in where) {
      whereString += `${key} = ? AND`;
      values.push(where[key])
    }

    setString = setString.substring(0, setString.length - 2);
    whereString = whereString.substring(0, whereString.length - 4);

    return this.query(`UPDATE ${table} SET ${setString} WHERE ${whereString}`, values);
  }
}

module.exports = MySQL;
