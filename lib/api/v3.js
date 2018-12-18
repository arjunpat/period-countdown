'use strict';
const BellData = require('./bell-data.js');

const bellData = new BellData(
	process.env.MYSQL_USERNAME,
	process.env.MYSQL_PASSWORD,
	process.env.MYSQL_DB,
	process.env.MYSQL_HOST
);

var generateResponse = (success, error = null, data = null) => {
	let res = {
		valid: true,
		headers: {},
		content: {
			success
		}
	}
	if (!success) res.content.error = error;
	if (data) res.content.data = data;
	res.content = JSON.stringify(res.content);

	return res;
}

const responses = {
	success: generateResponse(true),
	missing_data: generateResponse(false, 'missing_data'),
	bad_data: generateResponse(false, 'bad_data'),
	authorization: generateResponse(false, 'missing_authorization'),
	bad_path: generateResponse(false, 'bad_path')
}


module.exports = async (path, postData, req) => {

	if (!postData.data) return responses.missing_data;

	let device_id = postData.device_id;
	let data = postData.data;

	switch (path) {
		case '/init':

			let {user_agent, platform, browser} = data;

			if (user_agent && platform && browser) {
				// if we need to register a new device

				if (typeof browser === 'object') {
					let keys = Object.keys(browser);
					if (keys.length === 0)
						data.browser = 'unknown';
					else
						data.browser = Object.keys(browser)[0];
				}

				return generateResponse(true, null, {
					device_id: await bellData.createNewDevice(data)
				});

			} else if (device_id) {
				// if the device has already been registered

				let dataToSend;

				let {email, profile_pic, first_name, last_name, settings, error, school} = await bellData.getUserByDeviceId(device_id);

				if (error)
					dataToSend = { error };
				else if (email && profile_pic)
					dataToSend = {email, profile_pic, first_name, last_name, settings, school};
				else
					throw "Can't get user from device id";

				return generateResponse(true, null, dataToSend);

			}

			return responses.missing_data;
		case '/write/login':

			let {email, first_name, last_name, profile_pic} = data;

			if (!device_id || !email || !first_name || !last_name || !profile_pic)
				return responses.missing_data;

			let emailUserData = await bellData.getUserByEmail(email);

			if (emailUserData !== false) { // already have an account

				if (!bellData.isThisMe(data, emailUserData))
					await bellData.updateUser(data);

				await bellData.registerDevice(device_id, email);

				return generateResponse(true, null, {
					status: 'returning_user',
					user_data: {
						email,
						first_name,
						last_name,
						profile_pic,
						settings: emailUserData.settings,
						school: emailUserData.school
					}
				});
			}

			await bellData.createNewUser(data);
			await bellData.registerDevice(device_id, email);

			return generateResponse(true, null, {
				status: 'new_user',
				user_data: {
					email,
					first_name,
					last_name,
					profile_pic,
					settings: {}
				}
			});
			
		case '/write/logout':

			if (!device_id)
				return responses.missing_data;

			let deviceInfo = await bellData.getDeviceByDeviceId(device_id);

			if (deviceInfo.registered_to) {

				await bellData.unregister(device_id, deviceInfo.registered_to);

				return responses.success;

			}
			
			return responses.bad_data;

		case '/write/analytics':

			let { pathname, prefs, referrer, speed, registered_to, version } = data;

			if (!device_id || !pathname || !prefs || typeof referrer !== 'string' || !speed || !data.school)
				return responses.missing_data;

			let values = {
				device_id,
				time: Date.now(),
				pathname,
				ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
				referrer,
				version,
				period: prefs.period || undefined,
				prefs: prefs,
				theme: prefs.theme,
				speed: speed,
				tti: speed.tti,
				ttfb: speed.ttfb,
				user: registered_to || undefined,
				school: data.school
			}

			delete values.prefs.theme;
			delete values.prefs.period;
			delete values.speed.tti;
			delete values.speed.ttfb;

			values.prefs = JSON.stringify(values.prefs);
			values.speed = JSON.stringify(values.speed);

			for (let key in values) {
				if (typeof values[key] !== 'string' && typeof values[key] !== 'number' && typeof values[key] !== 'boolean' && typeof values[key] !== 'undefined') {
					return responses.bad_data;
				}
			}

			if (typeof values.school !== 'string' || values.school.length > 30) {
				return responses.bad_data;
			}

			if (await bellData.getDeviceByDeviceId(device_id)) {
				await bellData.createNewHit(values);
				return responses.success;
			}

			return responses.bad_data;
		case '/write/close-analytics':

			if (!device_id)
				return responses.missing_data;

			await bellData.closeHit(device_id);

			// we just assume success if they have the data
			return responses.success;
		case '/write/error':

			if (!device_id || typeof data.error !== 'string')
				return responses.bad_data;

			await bellData.createNewError(device_id, data.error);

			return responses.success;
		case '/update/preferences':

			if (!device_id || !data)
				return responses.missing_data;

			let {period_names, theme, school} = data;

			// validate theme
			if (typeof theme !== 'number' || theme > 10)
				return responses.bad_data;

			// validate period_names
			if (typeof period_names !== 'object' || Object.keys(period_names).length > 12)
				return responses.bad_data;

			for (let key in period_names) {
				if (!period_names.hasOwnProperty(key))
					continue;

				if (key.length >= 20 || period_names[key].length >= 20)
					return responses.bad_data;
			}

			// validate school
			if (typeof school !== 'string' || school.length > 20)
				return responses.bad_data;

			let res = await bellData.updatePreferences(device_id, period_names, theme, school);

			if (res.error)
				return generateResponse(false, res.error);
			
			return responses.success;
		default:
			return responses.bad_path;
	}

}
