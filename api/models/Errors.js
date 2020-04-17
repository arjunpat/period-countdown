
class Errors {
  constructor(mysql) {
    this.mysql = mysql;
  }

  create(device_id, error) {
    return this.mysql.insert('errors', {
      time: Date.now(),
      device_id,
      error
    });
  }
}

module.exports = Errors;
