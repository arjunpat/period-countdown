
class Users {
  constructor(mysql) {
    this.mysql = mysql;
  }

  async byDeviceId(device_id) {
    let resp = await this.mysql.query(
      'SELECT email, profile_pic, first_name, last_name, theme, period_names, school FROM users WHERE email IN (SELECT registered_to FROM devices WHERE device_id = ?)',
      [ device_id ]
    );

    if (resp.length === 0)
      return false;
    
    return resp[0];
  }

  createOrUpdate(email, first_name, last_name, profile_pic) {
    return this.mysql.query(
      'INSERT INTO users (email, first_name, last_name, profile_pic, time) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE first_name = ?, last_name = ?, profile_pic = ?',
      [email, first_name, last_name, profile_pic, Date.now(), first_name, last_name, profile_pic]
    );
  }

  async updatePrefs(device_id, school, theme, period_names) {
    let email = await this.mysql.query('SELECT registered_to FROM devices WHERE device_id = ?', [device_id]);
    email = email[0].registered_to;

    if (!email) return false;

    await this.mysql.update('users', {
      school,
      theme,
      period_names
    }, {
      email
    });

    return email;
  }
}

module.exports = Users;
