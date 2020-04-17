
class Hits {
  constructor(mysql) {
    this.mysql = mysql;
  }

  create(data) {
    return this.mysql.insert('hits', {
      time: Date.now(),
      ...data
    });
  }

  leave(device_id) {
    return this.mysql.query('UPDATE hits SET leave_time = ? WHERE device_id = ? ORDER BY time DESC LIMIT 1', [ Date.now(), device_id ]);
  }
}

module.exports = Hits;
