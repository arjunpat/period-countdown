"use strict";
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


module.exports = (path, postData) => {
	
	// TODO: limit size of any entry into the userData

	if (!postData.data) return responses.missing_data;

	switch (path) {
		case '/init':

			let {user_agent, platform, browser, device_id} = postData.data;
			
			if (user_agent && platform && browser) {
				// if we need to register a new device
				
				return generateResponse(true, null, {
					device_id: bellData.createNewDevice(postData.data)
				});

			} else if (device_id) {
				// if the device has already been registered
				
				let dataToSend;

				let {email, profile_pic, first_name, last_name, settings, error} = bellData.getUserDataByDeviceId(device_id);

				if (error)
					dataToSend = { error };
				else if (email && profile_pic)
					dataToSend = {email, profile_pic, first_name, last_name, settings};
				else
					dataToSend = { registered: false };

				return generateResponse(true, null, dataToSend);

			}

			return responses.missing_data;

			break;
		case '/write/login':

			let { device_id: id } = postData.data;
			let {email, first_name, last_name, profile_pic} = postData.data.account;

			if (!id || !email || !first_name || !last_name || !profile_pic)
				return responses.missing_data;

			if (typeof bellData.getUserIndexByEmail(email) === 'number') { // already have an account

				let emailUserData = bellData.getUserDataByEmail(email);

				if (bellData.isThisMe(postData.data.account, emailUserData)) {
					bellData.registerDevice(id, email);

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
				}
			} else {

				bellData.createNewUser(postData.data.account);
				bellData.registerDevice(id, email);

				return generateResponse(true, null, {
					status: 'new_user'
				});
			}

			break;
		case '/update/period_names':
			let {a: auth, data} = postData;

			if (!auth || !data)
				return responses.missing_data;

			let valuesToEnter = {};
			for (let i = 0; i <= 7; i++)
				if (data[i] && typeof data[i] === 'string' && data[i].length <= 20)
					valuesToEnter[i] = data[i];

			let res = bellData.updatePeriodNames(auth, valuesToEnter);

			if (res.error)
				return generateResponse(false, res.error);
			else
				return generateResponse(true);

			break;
		default:
			return responses.bad_path;
	}

}