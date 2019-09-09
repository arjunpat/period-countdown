const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const fetch = require('node-fetch');

const MySQL = require('../lib/MySQL');
const responses = require('../lib/responses');
const helpers = require('../lib/helpers');
const { JWT_SECRET, MYSQL_USER, MYSQL_PASS, MYSQL_HOST, MYSQL_DB } = process.env;

const admins = process.env.ADMIN_EMAILS.split(',');

const mysql = new MySQL(
  MYSQL_USER,
  MYSQL_PASS,
  MYSQL_DB,
  MYSQL_HOST
);

const timingData = require('../timing-data');
const themes = require('../options/themes');
const schoolIds = Object.keys(require('../timing-data'));

function generateId(length) {
  let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

router.all('*', async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.send({});
  }

  try {
    let contents = jwt.verify(req.cookies.periods_io, JWT_SECRET);
    req.device_id = contents.device_id;
    
    next();
  } catch (e) {
    let { user_agent, platform, browser } = req.body

    if (!user_agent || !platform || !browser)
      return res.send(responses.error('bad_token_and_body'));

    let device_id = generateId(10);

    await mysql.insert('devices', {
      device_id,
      time: Date.now(),
      platform,
      user_agent,
      browser: browser.join(',')
    });

    let cookie = jwt.sign({
      device_id
    }, JWT_SECRET);

    res.cookie('periods_io', cookie, {
      domain: process.env.NODE_ENV === 'production' ? '.periods.io' : undefined,
      maxAge: 4.73e11
    });

    req.device_id = device_id;

    next();
  }
});

router.use('/admin', require('./admin')(mysql));

/*
POST /v4/init
{
  "user_agent": "hi",
  "platform": "hi",
  "browser": ["chrome", "firefox"]
}
*/

router.post('/init', async (req, res) => {
  res.send(responses.success());
});


router.get('/account', async (req, res) => {
  let resp = await mysql.query('SELECT registered_to FROM devices WHERE device_id = ?', [req.device_id]);

  if (resp.length === 0) {
    return res.send(responses.error('no_device_exists'));
  }

  resp = resp[0].registered_to;

  resp = await mysql.query('SELECT email, profile_pic, first_name, last_name, theme, period_names, school FROM users WHERE email = ?', [resp]);

  if (resp.length === 0) {
    return res.send(responses.error('not_registered'))
  }

  let { email, profile_pic, first_name, last_name, theme, period_names, school } = resp[0];

  if (typeof theme !== 'number' || theme > themes.length) {
    theme = 0;
  }

  res.send(responses.success({
    email,
    profile_pic,
    first_name,
    last_name,
    theme: {
      theme,
      ...themes[theme]
    },
    admin: admins.includes(email) ? true : undefined,
    school: schoolIds.includes(school) ? school : 'mvhs',
    period_names: JSON.parse(period_names) || {}
  }));
});

/*
POST /v4/login
{
  "google_token": "aasdf.sdf.sdf"
}
*/

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

    resp = await mysql.query('SELECT email FROM users WHERE email = ?', [email]);

    let status;

    if (resp.length === 1) {
      await mysql.update('users', {
        profile_pic,
        first_name,
        last_name,
      }, {
        email
      });

      status = 'returning_user';
    } else {
      await mysql.insert('users', {
        email,
        first_name,
        last_name,
        profile_pic,
        time: Date.now()
      });

      status = 'new_user';
    }

    await mysql.update('devices', {
      registered_to: email,
      time_registered: Date.now()
    }, {
      device_id: req.device_id
    });

    res.send(responses.success({
      status
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

router.post('/thanks',
  [
    body('pathname').not().isEmpty(),
    body('version').not().isEmpty(),
    body('school').not().isEmpty(),
    body('period').not().isEmpty(),
    body('speed').not().isEmpty()
  ],
  async (req, res) => { // to prevent ad blocker stuff, etc
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send(responses.error({
        params: helpers.generateRequestIssues(errors.array())
      }));
    }

    let { pathname, referrer, version, school, period, speed, user } = req.body;

    await mysql.insert('hits', {
      time: Date.now(),
      device_id: req.device_id,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      pathname,
      referrer,
      version,
      school,
      period,
      dc: speed.dc, // dom complete
      pc: speed.pc, // page complete
      rt: speed.rt, // response time
      dns: speed.dns, // dns response time
      tti: speed.tti, // time to interactivity
      ttfb: speed.ttfb, // time to first byte
      user_theme: (user && user.theme) || null,
      user_period: (user && user.period) || null
    });

    res.send(responses.success());
  }
);

router.post('/thanks-again', async (req, res) => {
  await mysql.query('UPDATE hits SET leave_time = ? WHERE device_id = ? ORDER BY time DESC LIMIT 1', [Date.now(), req.device_id]);

  res.send(responses.success());
});

/*
POST /v4/error
{...}
*/

router.post('/error', async (req, res) => {
  let error = JSON.stringify(req.body);

  if (error.length > 4000) {
    return res.send(responses.success('error_too_long'));
  }

  await mysql.insert('errors', {
    device_id: req.device_id,
    time: Date.now(),
    error
  });

  res.send(responses.success());
});

/*
POST /v4/update-preferences
{
  "period_names": {
    "Period 1": "Math",
    "Period 5": "English"
  },
  "theme": 12,
  "school": "mvhs"
}
*/

router.post('/update-preferences', async (req, res) => {
  let { period_names, theme, school } = req.body;

  if (typeof theme !== 'number' || theme > 40 || typeof school !== 'string' || school.length > 40) {
    return res.send(responses.error('bad_data'));
  }

  if (Object.keys(period_names).length > 20) {
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

  await mysql.update('users', {
    school,
    theme,
    period_names: JSON.stringify(period_names)
  }, {
    email
  });

  await recordUptPref(email);

  res.send(responses.success());
});

async function recordUptPref(email) {
  let now = Date.now();
  await mysql.query(
    'DELETE FROM events WHERE time > ? AND email = ? AND event = ?',
    [now - 300000, email, 'upt_pref']
  );

  await mysql.insert('events', {
    time: now,
    email,
    event: 'upt_pref'
  });
}

/*
POST /v4/notif-on
{}
*/

router.post('/notif-on', async (req, res) => {
  let email = await mysql.query('SELECT registered_to FROM devices WHERE device_id = ?', [req.device_id]);
  email = email[0].registered_to;

  if (!email) {
    return res.send(responses.error('not_logged_in'));
  }

  let resp = await mysql.query('SELECT event FROM events WHERE email = ? AND event = "notif_on" AND item_id = ?', [email, req.device_id]);

  if (resp.length !== 0) {
    return res.send(responses.error('already_on'));
  }

  await mysql.insert('events', {
    time: Date.now(),
    email,
    event: 'notif_on',
    item_id: req.device_id
  });

  res.send(responses.success());
});

module.exports = router;
