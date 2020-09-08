const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult, cookie } = require('express-validator');

const db = require('../models');

const responses = require('../lib/responses');
const helpers = require('../lib/helpers');
const { JWT_SECRET } = process.env;

const admins = process.env.ADMIN_EMAILS.split(',');

const themes = require('../options/themes');
const schoolIds = Object.keys(require('../../../timing-data'));

const cookieOpts = {
  domain: process.env.NODE_ENV === 'production' ? '.periods.io' : undefined,
  maxAge: 4.73e11,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : undefined,
  secure: process.env.NODE_ENV === 'production' ? true : undefined,
};

router.use(async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.send({});
  }

  try {
    let contents = jwt.verify(req.cookies.periods_io, JWT_SECRET);
    req.device_id = contents.device_id;

    res.cookie('periods_io', req.cookies.periods_io, cookieOpts);

    next();
  } catch (e) {
    let { user_agent, platform, browser } = req.body

    if (!user_agent || !platform || !browser)
      return res.send(responses.error('bad_token_and_body'));

    let device_id = await db.devices.create(platform, browser.join(','), user_agent);

    let cookie = jwt.sign({
      device_id
    }, JWT_SECRET);

    res.cookie('periods_io', cookie, cookieOpts);

    req.device_id = device_id;

    next();
  }
});

router.use('/admin', require('./admin')(db));

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

  let { email, profile_pic, first_name, last_name, theme, period_names, school, rooms } = user;

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
    period_names: JSON.parse(period_names) || {},
    rooms: JSON.parse(rooms) || {}
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
  "referrer": "https://www.google.com",
  "school": "mvhs",
  "version": "3.0.10",
  "period": "Period 6",
  "dns": 0,
  "dc": 1371,
  "pc": 1774,
  "rt": 233,
  "ttfb": 392,
  "tti": 1062,
  "user_theme": 3,
  "user_period": "Personal Period Name",
}
*/

router.post('/thanks', // to prevent ad blocker stuff, etc
  [
    body('pathname').isString(),
    body('referrer').isString(),
    body('school').isString(),
    body('version').isString(),
    body('period').isString(),
    body('dns').isInt(),
    body('dc').isInt(),
    body('pc').isInt(),
    body('rt').isInt(),
    body('ttfb').isInt(),
    body('tti').isInt(),
    body('user_theme').optional().isInt(),
    body('user_period').optional().isString()
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send(responses.error({
        params: helpers.generateRequestIssues(errors.array())
      }));
    }

    let { pathname, referrer, version, school, period, user } = req.body;
    let d = req.body;

    await db.hits.create({
      device_id: req.device_id,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      pathname,
      referrer,
      version,
      school,
      period,
      dc: d.dc, // dom complete
      pc: d.pc, // page complete
      rt: d.rt, // response time
      dns: d.dns, // dns response time
      tti: d.tti, // time to interactivity
      ttfb: d.ttfb, // time to first byte
      user_theme: d.user_theme || null,
      user_period: d.user_period || null
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
  "rooms": {
    "Period 1": {
      "type": "url",
      "url": ""
    }
  },
  "theme": 12,
  "school": "mvhs"
}
*/

router.post('/update-preferences', async (req, res) => {
  let { period_names, theme, school, rooms } = req.body;

  if (typeof theme !== 'number' || theme > 40 || typeof school !== 'string' || !schoolIds.includes(school)) {
    return res.send(responses.error('bad_data'));
  }

  if (Object.keys(period_names).length > 20) {
    return res.send(responses.error('bad_data'));
  }

  for (let key in period_names) {
    if (key.length > 40 || period_names[key].length > 40) {
      return res.send(responses.error('bad_data'));
    }
  }

  const goodRooms = {};
  for (let key in rooms) {
    if (key.length < 40 && rooms[key].type === 'url' && typeof rooms[key].url === 'string') {
      goodRooms[key] = {
        type: 'url',
        url: rooms[key].url
      };
    }
  }

  let email = await db.users.updatePrefs(req.device_id, school, theme, JSON.stringify(period_names), JSON.stringify(rooms));

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
