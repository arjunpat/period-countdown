const router = require('express').Router();
const responses = require('../lib/responses');

const admins = process.env.ADMIN_EMAILS.split(',');
let mysql;

router.all('*', async (req, res, next) => {
  try {
    let res = await mysql.query('SELECT registered_to FROM devices WHERE device_id = ?', [ req.device_id ]);

    if (admins.includes(res[0].registered_to)) {
      next();
    } else {
      throw 'Not admin';
    }
  } catch (e) {
    res.send(responses.error('admin_only'));
  }

});

async function colStats(table, col, from, to) {
  return (await mysql.query(
    `SELECT MAX(${col}) AS max, MIN(${col}) AS min, AVG(${col}) AS avg, STD(${col}) as std FROM ${table} WHERE time > ? AND time < ?`,
    [from, to]
  ))[0];
}

async function colPopular(table, col, limit, from, to) {
  return await mysql.query(
    `SELECT ${col}, COUNT(*) AS count FROM ${table} WHERE time > ? AND time < ? GROUP BY ${col} ORDER BY count DESC LIMIT ${limit}`,
    [from, to]
  );
}

router.get('/analytics', async (req, res) => {
  let from = parseInt(req.query.from);
  let to = parseInt(req.query.to);

  let data = {
    hits: {},
    devices: {},
    errors: {},
    events: {},
    users: {},
    totals: {
      devices: {}
    }
  }
  let resp;

  let start = Date.now();

  // hits
  resp = await mysql.query('SELECT COUNT(*) FROM hits WHERE time > ? AND time < ?', [from, to]);
  data.hits.count = resp[0]['COUNT(*)'];
  resp = await mysql.query(
    'SELECT COUNT(*) FROM hits WHERE time > ? AND time < ? AND device_id IN (SELECT device_id FROM devices WHERE registered_to IS NOT NULL)',
    [from, to]
  );
  data.hits.hits_from_users = resp[0]['COUNT(*)'];
  data.hits.versions = await colPopular('hits', 'version', 10, from, to);
  data.hits.ip = await colPopular('hits', 'ip', 20, from, to);
  data.hits.pathname = await colPopular('hits', 'pathname', 10, from, to);
  data.hits.referrer = await colPopular('hits', 'referrer', 10, from, to);
  data.hits.school = await colPopular('hits', 'school', 20, from, to);
  data.hits.period = await colPopular('hits', 'period', 30, from, to);
  data.hits.dc = await colStats('hits', 'dc', from, to);
  data.hits.pc = await colStats('hits', 'pc', from, to);
  data.hits.rt = await colStats('hits', 'rt', from, to);
  data.hits.dns = await colStats('hits', 'dns', from, to);
  data.hits.tti = await colStats('hits', 'tti', from, to);
  data.hits.ttfb = await colStats('hits', 'ttfb', from, to);
  resp = await mysql.query(
    'SELECT COUNT(DISTINCT device_id) FROM hits WHERE time > ? AND time < ?',
    [from, to]
  );
  data.hits.unique_devices = resp[0]['COUNT(DISTINCT device_id)'];
  resp = await mysql.query(
    'SELECT COUNT(DISTINCT registered_to) FROM devices WHERE device_id IN (SELECT device_id FROM hits WHERE time > ? AND time < ?)', [from, to]
  );
  data.hits.unique_users = resp[0]['COUNT(DISTINCT registered_to)'];

  // devices
  resp = await mysql.query('SELECT COUNT(*) FROM devices WHERE time > ? AND time < ?', [from, to]);
  data.devices.count = resp[0]['COUNT(*)'];
  resp = await mysql.query('SELECT COUNT(*) FROM devices WHERE time_registered > ? AND time_registered < ?', [from, to]);
  data.devices.count_registered = resp[0]['COUNT(*)'];

  // errors
  resp = await mysql.query('SELECT COUNT(*) FROM errors WHERE time > ? AND time < ?', [from, to]);
  data.errors.count = resp[0]['COUNT(*)'];
  resp = await mysql.query('SELECT * FROM errors WHERE time > ? AND time < ?', [from, to]);
  // data.errors.errors = resp;

  // events
  resp = await mysql.query('SELECT COUNT(*) FROM events WHERE time > ? AND time < ?', [from, to]);
  data.events.count = resp[0]['COUNT(*)'];
  resp = await mysql.query('SELECT COUNT(*) FROM events WHERE event = ? AND time > ? AND time < ?', ['upt_pref', from, to]);
  data.events.upt_pref = resp[0]['COUNT(*)'];
  
  // users
  resp = await mysql.query('SELECT COUNT(*) FROM users WHERE time > ? AND time < ?', [from, to]);
  data.users.count = resp[0]['COUNT(*)'];

  // totals
  resp = await mysql.query('SELECT COUNT(*) FROM hits');
  data.totals.hits = resp[0]['COUNT(*)'];
  resp = await mysql.query('SELECT COUNT(*) FROM devices');
  data.totals.devices.count = resp[0]['COUNT(*)'];
  resp = await mysql.query('SELECT COUNT(*) FROM devices WHERE registered_to IS NOT NULL');
  data.totals.devices.registered = resp[0]['COUNT(*)'];
  resp = await mysql.query('SELECT COUNT(*) FROM errors');
  data.totals.errors = resp[0]['COUNT(*)'];
  resp = await mysql.query('SELECT COUNT(*) FROM events');
  data.totals.events = resp[0]['COUNT(*)'];
  resp = await mysql.query('SELECT COUNT(*) FROM users');
  data.totals.users = resp[0]['COUNT(*)'];

  data.analysis_time = Date.now() - start;
  res.send(responses.success(data));
});

module.exports = a => {
  mysql = a;

  return router;
}