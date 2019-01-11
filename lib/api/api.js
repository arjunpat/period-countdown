const express = require('express');
const router = express.Router();
const responses = require('./responses');
const timingData = require('./timing-data');

const version = (process.env.NODE_ENV === 'production') ? require('../../package.json').version : '0.4.2';

router.get('/time', (req, res) => {

	res.set({
		'Content-Type': 'application/json',
		'Cache-Control': 'no-cache, no-store, must-revalidate'
	});

	res.send({
		success: true,
		data: {
			ms: Date.now()
		}
	});
});

router.get('/version', (req, res) => {
	res.set({
		'Content-Type': 'application/json',
		'Cache-Control': 'no-cache, no-store, must-revalidate'
	});

	res.send({
		success: true,
		data: {
			version
		}
	});
});

router.get('/schedule/:school', (req, res) => {
	let school = req.params.school;

	if (typeof timingData[school] === 'object') {
		res.set({
			'Cache-control': 'max-age=600',
			'Content-type': 'application/json; charset=UTF-8'
		});

		return res.send(timingData[school].schedule);
	}

	res.send(responses.badRequest());
});

router.get('/schedule', (_, r) => r.send({}));

router.get('/school/:school', (req, res) => {
	let school = req.params.school;

	if (typeof timingData[school] === 'object') {
		res.set({
			'Cache-control': 'max-age=43200',
			'Content-type': 'application/json; charset=UTF-8'
		});

		return res.send(timingData[school].school);
	}

	res.send(responses.badRequest());
});

router.get('/school', (_, r) => r.send({}));

router.use('/v3', require('./v3'));

module.exports = router;
