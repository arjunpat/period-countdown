'use strict';
const bellData = require('./bell-data.js');

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


module.exports = async (path, postData) => {

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

				let {email, profile_pic, first_name, last_name, settings, error} = await bellData.getUserByDeviceId(device_id);

				if (error)
					dataToSend = { error };
				else if (email && profile_pic)
					dataToSend = {email, profile_pic, first_name, last_name, settings};
				else
					throw "Can't get user from device id";

				return generateResponse(true, null, dataToSend);

			}

			return responses.missing_data;

			break;
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
						settings: emailUserData.settings
					}
				});
			} else {

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
			}

			break;
		case '/write/logout':

			if (!device_id)
				return responses.missing_data;

			let deviceInfo = await bellData.getDeviceByDeviceId(device_id);

			if (deviceInfo.registered_to) {

				await bellData.unregister(device_id, deviceInfo.registered_to);

				return responses.success;

			} else
				return responses.bad_data;


			break;
		case '/write/analytics':

			let {pathname, prefs, referrer, speed, new_load, registered_to} = data;

			if (!device_id || !pathname || !prefs || typeof referrer !== 'string' || !speed || typeof new_load !== 'boolean')
				return responses.missing_data;

			let values = {
				device_id,
				time: Date.now(),
				pathname,
				referrer,
				new_load,
				period: prefs.period || null,
				prefs: prefs,
				theme: prefs.theme,
				speed: speed,
				tti: speed.tti,
				ttfb: speed.ttfb,
				user: registered_to || null
			};

			delete values.prefs.theme;
			delete values.prefs.period;
			delete values.speed.tti;
			delete values.speed.ttfb;

			values.prefs = JSON.stringify(values.prefs);
			values.speed = JSON.stringify(values.speed);

			for (let key in values)
				if (key !== 'user' && key !== 'period' && typeof values[key] !== 'string' && typeof values[key] !== 'number' && typeof values[key] !== 'boolean')
					return responses.bad_data;

			if (typeof values.period === 'string' || (values.pathname === '/' && typeof values.period !== 'number'))
				return responses.bad_data;

			await bellData.createNewHit(values);

			return responses.success;

			break;
		case '/write/error':

			if (!device_id || typeof data.error !== 'string')
				return responses.bad_data;

			let user = await bellData.getUserByDeviceId(device_id);

			if (user.error)
				await bellData.createNewError(device_id, data.error, null);
			else
				await bellData.createNewError(device_id, data.error, user.email);

			return responses.success;

			break;
		case '/update/preferences':

			if (!device_id || !data)
				return responses.missing_data;

			let {period_names, theme} = data;

			// validate theme
			if (typeof theme !== 'number' || theme > 10)
				return responses.bad_data;

			// validate period_names
			let valuesToEnter = {};
			for (let i = 0; i <= 7; i++)
				if (period_names[i] && typeof period_names[i] === 'string' && period_names[i].length <= 20)
					valuesToEnter[i] = period_names[i];

			let res = await bellData.updatePreferences(device_id, valuesToEnter, theme);

			if (res.error)
				return generateResponse(false, res.error);
			else
				return responses.success;

			break;
		default:
			return responses.bad_path;
	}

}
