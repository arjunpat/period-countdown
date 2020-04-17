const helpers = require('../lib/helpers');

class Devices {
  constructor(mysql) {
    this.mysql = mysql;
  }

  async create(platform, browser, user_agent) {
    let device_id = helpers.generateId(10);
    await this.mysql.insert('devices', {
      device_id,
      time: Date.now(),
      platform,
      user_agent,
      browser
    });

    return device_id;
  }

  deviceExists(device_id) {
    return mysql.query('SELECT registered_to FROM devices WHERE device_id = ?', [device_id]).then(d => d.length === 1);
  }

  login(device_id, email) {
    return this.mysql.update('devices', {
      registered_to: email,
      time_registered: Date.now()
    }, {
      device_id
    });
  }

  logout(device_id) {
    return this.mysql.update('devices', {
      registered_to: null,
      time_registered: null
    }, {
      device_id
    });
  }
}

module.exports = Devices;
