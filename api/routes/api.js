const router = require('express').Router();
const responses = require('../lib/responses');
const timingData = require('../timing-data');
const themes = JSON.stringify(require('../options/themes'));
const schools = JSON.stringify(timingData.schools);

router.use('/v4', require('./v4'));

router.get('/time', (req, res) => {
  res.send(responses.success(Date.now()));
});

router.get('/schedule/:school', (req, res) => {
  let { school } = req.params;

  if (typeof timingData[school] === 'object') {
    res.set('Cache-Control', 'max-age=900');
    return res.send(timingData[school].schedule);
  }

  res.send(responses.error('missing_school'));
});

router.get('/school/:school', (req, res) => {
  let { school } = req.params;

  if (typeof timingData[school] === 'object') {
    res.set('Cache-Control', 'max-age=43200');
    return res.send(timingData[school].school);
  }

  res.send(responses.error('missing_school'));
});

router.get('/periods/:school', (req, res) => {
  let { school } = req.params;

  if (typeof timingData[school] === 'object') {
    res.set('Cache-Control', 'max-age=43200');
    return res.send(timingData[school].periods);
  }

  res.send(responses.error('missing_school'));
});

router.get('/themes', (req, res) => {
  res.set({
    'Cache-Control': 'max-age=43200',
    'Content-Type': 'application/json'
  });
  res.send(themes);
});

router.get('/schools', (req, res) => {
  res.set({
    'Cache-Control': 'max-age=43200',
    'Content-Type': 'application/json'
  });
  res.send(schools);
});

router.all('*', (req, res) => {
  res.send(responses.error('not_found'));
});

module.exports = router;
