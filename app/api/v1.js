"use strict";
const bellData = require('./bell-data.js');


// example request
// TODO: think about device id's and having associatied devices

// on load

'if device has id';
'POST /api/v1/load';
/*{
	data: {
		device_id: 'H23jfksdD'
	}
}
'response'
{
	success: true,
	data: {
		first_name: 'Arjun',
		last_name: 'Patrawala',
		email: 'ajpat1234@gmail.com',
		profile_pic: 'htasdf',
		settings: {
			period_names: {
				period_0: 'Nothing',
				period_1: '', // default name
				period_2: 'Journalism',
				period_3: 'Physical Education',
				period_4: 'Bio',
				period_5: 'History',
				period_6: 'Spanish',
				period_7: 'Survey Comp/Lit'
			},
			theme: [
				'default', 'default_reverse' // last being most recent
			]
		}
	}
}
// if not registered to a Google account yet
{
	success: true,
	data: {
		registered: false
	}
}



'if device lacks id';
'POST /api/v1/init'
{	
	data: {
		user_agent: 'thing',
		browser: 'Chrome',
		platform: 'MacIntel'
	}
}
// creates device
'response';
{
	success: true,
	data: {
		device_id: 'asJfiej2k3'
	}
}
// if creates a device and does not recieve a analytics recording in like 30 sec, delete the device b/c it is probably spam
// make sure that non_registered stupid computers get deleted after a while of no use (like a week or so)

// ALWAYS send analytics
'POST /api/v1/write/analytics';
{
	data: {
		device_id: 'asJfiej2k3',
		referer: 'https://www.google.com',
		speed: {
				
		},
		prefs: {
			theme: 'asdf',
			period: 4,
			period_name: 'history'
		}
	}
}
'response';
{
	success: true
}
// don't allow another analytics request for like 30 seconds
// limit size of all requests

// make sure it can handle the accidental creation of same id twice


'POST /api/v1/write/login';
{
	data: {
		device_id: 'asJfiej2k3',
		account: {
			email: 'ajpat1234@gmail.com',
			first_name: 'Arjun',
			last_name: 'Patrawala',
			profile_pic: 'https;asdf/asd/fsadf'
		}
	}
}
'response';
{
	success: true,
	data: {
		status: 'new_user' // or returning_user
	}
}

'POST /api/v1/write/logout';
{
	data: {
		device_id: 'asJfiej2k3'
	}
}
// make sure to remove this also from the user profile as well
// you can keep the device in the database


'POST /api/v1/update/period_names'
{
	a: 'ajpat1234@gmail.com',
	data: {
		period_0: 'hello' // updateObjectWithValues
	}
}

'POST /api/v1/update/theme';
{
	a: 'ajpat1234@gmail.com',
	data: {
		new_theme: 'default_reverse'
	}
}

'POST /api/v1/update/name'
{
	a: 'ajpat1234@gmail.com',
	data: {
		first_name: 'Arjun' // updateObjectWithValues
	}
}*/




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
				
				return generateResponse(true, null, bellData.getUserDataByDeviceId(device_id));

			}

			return responses.missing_data;

			break;
		case '/write/login':
		
			let { device_id: id } = postData.data;
			let {email, first_name, last_name, profile_pic} = postData.data.account;

			if (!id || !email || !first_name || !last_name || !profile_pic) return responses.missing_data;

			if (typeof bellData.getUserIndexByEmail(email) === 'number') { // already have an account

				if (bellData.isThisMe(postData.data.account, bellData.getUserDataByEmail(email))) {
					bellData.registerDevice(id, email);

					return generateResponse(true, null, {
						status: 'returning_user'
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
		default:
			return responses.bad_path;
	}

}