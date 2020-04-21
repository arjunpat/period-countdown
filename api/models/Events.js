
class Events {
  constructor(mysql) {
    this.mysql = mysql;
  }

  async recordUptPref(email, device_id) {
    let now = Date.now();
    await this.mysql.query(
      'DELETE FROM events WHERE time > ? AND email = ? AND event = ?',
      [now - 300000, email, 'upt_pref']
    );

    await this.mysql.insert('events', {
      time: now,
      email,
      event: 'upt_pref',
      item_id: device_id
    });
  }

  async notifOn(device_id) {
    let resp = await this.mysql.query('SELECT event FROM events WHERE event = "notif_on" AND item_id = ?', [ device_id ]);

    if (resp.length !== 0) return false;

    await this.mysql.insert('events', {
      time: Date.now(),
      event: 'notif_on',
      item_id: device_id
    });
    
    return true;
  }
}

module.exports = Events;
