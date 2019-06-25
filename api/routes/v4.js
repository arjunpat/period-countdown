const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const fetch = require('node-fetch');

const MySQL = require('../lib/MySQL');
const responses = require('../lib/responses');
const helpers = require('../lib/helpers');
const { JWT_SECRET, MYSQL_USER, MYSQL_PASS, MYSQL_HOST, MYSQL_DB } = process.env;

const mysql = new MySQL(
  MYSQL_USER,
  MYSQL_PASS,
  MYSQL_DB,
  MYSQL_HOST
);

function generateId(length) {
  let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

router.all('*', async (req, res, next) => {
  try {
    let contents = jwt.verify(req.cookies.periods_io, JWT_SECRET);
    req.device_id = contents.device_id;
    
    next();
  } catch (e) {
    let { user_agent, platform, browser } = req.body

    if (!user_agent || !platform)
      res.send(responses.error('bad_token_and_body'));

    if (typeof browser === 'object') {
      browser = Object.keys(browser);
    } else {
      browser = [];
    }

    let device_id = generateId(20);

    await mysql.insert('devices', {
      device_id,
      time: Date.now(),
      properties: JSON.stringify({
        user_agent,
        platform,
        browser
      })
    });

    let cookie = jwt.sign({
      device_id
    }, JWT_SECRET);

    res.cookie('periods_io', cookie, {
      domain: process.env.NODE_ENV === 'production' ? 'periods.io' : undefined
    });

    req.device_id = device_id;

    next();
  }
});

router.post('/init', async (req, res) => {
  let resp = await mysql.query('SELECT registered_to FROM devices WHERE device_id = ?', [req.device_id]);

  if (resp.length === 0) {
    return res.send(responses.error('no_device_exists'));
  }

  resp = resp[0].registered_to;

  resp = await mysql.query('SELECT email, profile_pic, first_name, last_name, settings FROM users WHERE email = ?', [resp]);

  if (resp.length === 0) {
    return res.send(responses.error('not_registered'))
  }

  resp[0].settings = JSON.parse(resp[0].settings);

  res.send(responses.success(resp[0]));
});

router.post('/login',
  [
    body('google_token').not().isEmpty()
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send(responses.error({
        params: helpers.generateRequestIssues(errors.array())
      }));
    }

    let resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo?access_token=' + encodeURIComponent(req.body.google_token));
    resp = await resp.json();

    let {
      email,
      given_name: first_name,
      family_name: last_name,
      picture: profile_pic,
      email_verified
    } = resp;

    if (!email_verified) {
      return res.send(responses.error('email_not_verified'));
    }

    resp = await mysql.query('SELECT settings FROM users WHERE email = ?', [email]);

    let status, settings;

    if (resp.length === 1) {
      await mysql.update('users', {
        profile_pic,
        first_name,
        last_name,
      }, {
        email
      });

      status = 'returning_user';
      settings = JSON.parse(resp[0].settings);
    } else {
      await mysql.insert('users', {
        email,
        first_name,
        last_name,
        profile_pic,
        time: Date.now(),
        settings: '{}',
        stats: '{}'
      });

      status = 'new_user';
      settings = {};
    }

    await mysql.update('devices', {
      registered_to: email,
      time_registered: Date.now()
    }, {
      device_id: req.device_id
    });

    res.send(responses.success({
      status,
      user_data: {
        email,
        first_name,
        last_name,
        profile_pic,
        settings
      }
    }));
  }
);

router.post('/logout', async (req, res) => {
  await mysql.update('devices', {
    time_registered: null,
    registered_to: null
  }, {
    device_id: req.device_id
  });

  res.send(responses.success());
});


/*
POST /v4/thanks
{
  "pathname": "/",
  "user": {
    "theme": 3,
    "period": "Personal Period Name"
  },
  "referrer": "https://www.google.com",
  "school": "mvhs",
  "speed": {
    "dns": 0,
    "dom_complete": 1371,
    "page_complete": 1774,
    "response_time": 233,
    "ttfb": 392,
    "tti": 1062
  },
  "version": "3.0.10",
  "period": "Period 6"
}
*/

router.post('/thanks', async (req, res) => { // to prevent ad blocker stuff, etc
  let { pathname, referrer, version, school, period, speed, user } = req.body;

  await mysql.insert('hits', {
    time: Date.now(),
    device_id: req.device_id,
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    properties: JSON.stringify({
      pathname,
      referrer,
      version,
      speed: {
        dns: speed.dns,
        dc: speed.dom_complete,
        pc: speed.page_complete,
        rt: speed.response_time,
        ttfb: speed.ttfb,
        tti: speed.tti
      },
      school,
      period,
      user: {
        theme: user.theme,
        period: user.period
      }
    })
  });

  res.send(responses.success());
});

router.post('/thanks-again', async (req, res) => {
  await mysql.query('UPDATE hits SET leave_time = ? WHERE device_id = ? ORDER BY db_id DESC LIMIT 1', [Date.now(), req.device_id]);

  res.send(responses.success());
});

router.post('/error', async (req, res) => {
  await mysql.insert('errors', {
    device_id: req.device_id,
    time: Date.now(),
    error: JSON.stringify(req.body)
  });

  res.send(responses.success());
});

router.post('/update-preferences', async (req, res) => {
  let { period_names, theme, school } = req.body;

  if (typeof theme !== 'number' || theme > 40 || typeof school !== 'string' || school.length > 40) {
    return res.send(responses.error('bad_data'));
  }

  for (let key in period_names) {
    if (!period_names.hasOwnProperty(key))
      continue;

    if (key.length > 40 || period_names[key].length > 40) {
      return res.send(responses.error('bad_data'));
    }
  }

  let email = await mysql.query('SELECT registered_to FROM devices WHERE device_id = ?', [req.device_id]);
  email = email[0].registered_to;

  if (!email) {
    return res.send(responses.error('not_logged_in'));
  }

  let resp = await mysql.query('SELECT stats, settings FROM users WHERE email = ?', [email]);

  let settings = JSON.stringify({
    theme,
    period_names,
    school
  });

  if (settings === resp[0].settings) {
    return res.send(responses.error('no_changes'));
  }

  let stats = JSON.parse(resp[0].stats);
  if (!stats.pref_changes) {
    stats.pref_changes = [];
  }
  stats.pref_changes.push(Date.now());

  await mysql.update('users', {
    settings,
    stats: JSON.stringify(stats)
  }, {
    email
  });

  res.send(responses.success());
});

module.exports = router;