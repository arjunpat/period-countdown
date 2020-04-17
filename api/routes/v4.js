const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const db = require('../models');

const responses = require('../lib/responses');
const helpers = require('../lib/helpers');
const { JWT_SECRET } = process.env;

const admins = process.env.ADMIN_EMAILS.split(',');

const themes = require('../options/themes');
const schoolIds = Object.keys(require('../timing-data'));

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

    let device_id = await db.devices.create(platform, browser.join(','), user_agent);

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

// router.use('/admin', require('./admin')(mysql));

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
  let user = await db.users.byDeviceId(req.device_id);

  if (!user)
    return res.send(responses.error());

  let { email, profile_pic, first_name, last_name, theme, period_names, school } = user;

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

router.post('/login', async (req, res) => {
  let resp = await helpers.validateGoogleToken(req.body.google_token);

  if (!resp)
    return res.send(responses.error('bad_token'));

  let {
    email,
    given_name: first_name,
    family_name: last_name,
    picture: profile_pic,
  } = resp;

  await db.users.createOrUpdate(email, first_name, last_name, profile_pic);
  await db.devices.login(req.device_id, email);

  res.send(responses.success());
});

router.post('/logout', async (req, res) => {
  await db.devices.logout(req.device_id);

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

router.post('/thanks', // to prevent ad blocker stuff, etc
  [
    body('pathname').not().isEmpty(),
    body('version').not().isEmpty(),
    body('school').not().isEmpty(),
    body('period').not().isEmpty(),
    body('speed').not().isEmpty()
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send(responses.error({
        params: helpers.generateRequestIssues(errors.array())
      }));
    }

    let { pathname, referrer, version, school, period, speed, user } = req.body;

    await db.hits.create({
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
  await db.hits.leave(req.device_id);
  res.send(responses.success());
});

/*
POST /v4/error
{...}
*/

router.post('/error', async (req, res) => {
  let error = JSON.stringify(req.body);

  if (error.length > 4000)
    return res.send(responses.success('error_too_long'));

  await db.errors.create(req.device_id, error);

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

  if (typeof theme !== 'number' || theme > 40 || typeof school !== 'string' || !schoolIds.includes(school)) {
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

  let email = await db.users.updatePrefs(req.device_id, school, theme, JSON.stringify(period_names));

  if (!email)
    return res.send(responses.error('not_logged_in'));

  await db.events.recordUptPref(email, req.device_id);

  res.send(responses.success());
});

/*
POST /v4/notif-on
{}
*/

router.post('/notif-on', async (req, res) => {
  let resp = await db.events.notifOn(req.device_id);

  if (!resp) return res.send(responses.error('already_on'));

  res.send(responses.success());
});

module.exports = router;
