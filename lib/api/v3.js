const https = require('https');
const express = require('express');
const router = express.Router();
const responses = require('./responses');

const BellData = require('./bell-data.js');

const bellData = new BellData(
	process.env.MYSQL_USERNAME,
	process.env.MYSQL_PASSWORD,
	process.env.MYSQL_DB,
	process.env.MYSQL_HOST
);

router.post('*', (req, res, next) => {

	if (typeof req.body.data !== 'object') {
		return res.send(responses.error('missing_data'));
	}

	req.device_id = req.body.device_id;
	next();
});

router.post('/init', async (req, res) => {

	let {user_agent, platform, browser} = req.body.data;

	if (user_agent && platform && browser) {
		// if we need to register a new device

		if (typeof browser === 'object') {
			let keys = Object.keys(browser);
			if (keys.length === 0)
				req.body.data.browser = 'unknown';
			else
				req.body.data.browser = Object.keys(browser)[0];
		}

		return res.send(responses.success({
			device_id: await bellData.createNewDevice(req.body.data)
		}));

	} else if (req.device_id) {
		// if the device has already been registered

		let dataToSend;

		let {email, profile_pic, first_name, last_name, settings, error, school} = await bellData.getUserByDeviceId(req.device_id);

		if (error)
			dataToSend = { error };
		else if (email && profile_pic)
			dataToSend = {email, profile_pic, first_name, last_name, settings, school};
		else
			return res.send(responses.error('bad_device_id'));

		return res.send(responses.success(dataToSend));

	}

	res.send(responses.error('missing_data'));
});


function getGoogleUser(token) {
	return new Promise((resolve, reject) => {

		let req = https.get(new URL('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + encodeURIComponent(token)), res => {
			let output = '';
			res.setEncoding('utf8');

			res.on('data', chunk => output += chunk);

			res.on('end', () => {
				let obj = JSON.parse(output);

				let { email, given_name, family_name, picture, email_verified } = obj;

				if (email && given_name && family_name && picture && email_verified) {
					resolve({
						email,
						first_name: given_name,
						last_name: family_name,
						profile_pic: picture
					});
				} else {
					reject();
				}

			});
		});

		req.on('error', err => {
			reject(err);
		});

		req.end();
	});
}

router.post('/write/login', (req, res) => {

	let { token } = req.body.data;

	if (!token || !req.device_id) {
		return res.send(responses.error('missing_data'));
	}

	getGoogleUser(token).then(async user => {

		let {email, first_name, last_name, profile_pic} = user;

		let userData = await bellData.getUserByEmail(email);

		if (userData !== false) { // already have an account

			await bellData.updateUser(user);
			await bellData.registerDevice(req.device_id, email);

			return res.send(responses.success({
				status: 'returning_user',
				user_data: {
					email,
					first_name,
					last_name,
					profile_pic,
					settings: userData.settings,
					school: userData.school
				}
			}));
		}

		await bellData.createNewUser(user);
		await bellData.registerDevice(req.device_id, email);

		res.send(responses.success({
			status: 'new_user',
			user_data: {
				email,
				first_name,
				last_name,
				profile_pic,
				settings: {}
			}
		}));

	}).catch(err => {
		console.log(err);
		res.send(responses.error('bad_token'));
	});

});

router.post('/write/logout', async (req, res) => {

	if (!req.device_id) {
		return res.send(responses.error('missing_data'));
	}

	await bellData.unregister(req.device_id);
	return res.send(responses.success());

});

router.post('/write/analytics', async (req, res) => {

	let { pathname, prefs, referrer, speed, version, school } = req.body.data;

	if (!req.device_id || !pathname || !prefs || typeof referrer !== 'string' || !speed || !school)
		return res.send(responses.error('missing_data'));

	let values = {
		device_id: req.device_id,
		time: Date.now(),
		pathname,
		ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
		referrer,
		version,
		period: prefs.period,
		prefs: prefs,
		theme: prefs.theme,
		speed: speed,
		tti: speed.tti,
		ttfb: speed.ttfb,
		school
	}

	delete values.prefs.theme;
	delete values.prefs.period;
	delete values.speed.tti;
	delete values.speed.ttfb;

	// temp
	if (values.speed.page_complete < 0) {
		values.speed.page_complete = values.tti;
	}

	values.prefs = JSON.stringify(values.prefs);
	values.speed = JSON.stringify(values.speed);


	if (typeof values.school !== 'string' || values.school.length > 30) {
		return res.send(responses.error('bad_data'));
	}

	if (await bellData.getDeviceByDeviceId(req.device_id)) {
		await bellData.createNewHit(values);
		return res.send(responses.success());
	}

	res.send(responses.error('bad_data'));
});

router.post('/write/close-analytics', async (req, res) => {

	if (!req.device_id) {
		return res.send(responses.error('missing_data'));
	}

	await bellData.closeHit(req.device_id);

	// we just assume success if they have the data
	return res.send(responses.success());

});

router.post('/write/error', async (req, res) => {

	if (!req.device_id || typeof req.body.data.error !== 'string')
		return res.send(responses.error('bad_data'));

	await bellData.createNewError(req.device_id, req.body.data.error);

	res.send(responses.success());

});

router.post('/update/preferences', async (req, res) => {

	if (!req.device_id)
		return res.send(responses.error('missing_data'));

	let { period_names, theme, school } = req.body.data;

	// validate theme
	if (typeof theme !== 'number' || theme > 10) {
		return res.send(responses.error('bad_data'));
	}

	// validate period_names
	if (typeof period_names !== 'object' || Object.keys(period_names).length > 12) {
		return res.send(responses.error('bad_data'));
	}

	for (let key in period_names) {
		if (!period_names.hasOwnProperty(key))
			continue;

		if (key.length > 20 || period_names[key].length > 20) {
			return res.send(responses.error('bad_data'));
		}
	}

	// validate school
	if (typeof school !== 'string' || school.length > 20) {
		return res.send(responses.error('bad_data'));
	}

	let response = await bellData.updatePreferences(req.device_id, period_names, theme, school);

	if (response.error) {
		return res.send(responses.error(response.error));
	}
	
	res.send(responses.success());
});

module.exports = router;
