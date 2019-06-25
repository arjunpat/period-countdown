const router = require('express').Router();
const responses = require('../lib/responses');
const timingData = require('../timing-data');

router.use('/v4', require('./v4'));

router.get('/time', (req, res) => {
  res.send(responses.success({
    ms: Date.now()
  }));
});

router.get('/schedule/:school', (req, res) => {
  let { school } = req.params;

  if (typeof timingData[school] === 'object') {
    return res.send(timingData[school].schedule);
  }

  res.send(responses.error('missing_school'));
});

router.get('/school/:school', (req, res) => {
  let { school } = req.params;

  if (typeof timingData[school] === 'object') {
    return res.send(timingData[school].school);
  }

  res.send(responses.error('missing_school'));
});

router.all('*', (req, res) => {
  res.send(responses.error('not_found'));
});

module.exports = router;
