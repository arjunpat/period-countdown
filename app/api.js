const fs = require('fs');
const utils = require('./utils.js');

class BellData {
	constructor() {
		this.data = {};

		if (process.env.NODE_ENV === 'production') {
			this.filename = '/home/centos/serve/data/bell_data.json';
		} else {
			this.filename = './dev_data/bell_data.json';
		}

		try {
			this.data = JSON.parse(fs.readFileSync(this.filename).toString());
		} catch (e) {
			this.data = {
				hits: [],
				users: {}
			}

			fs.appendFileSync(this.filename, JSON.stringify(this.data));
		}


	}

	recordHit(params) {

	}

	createUser(params) {

	}

	retrieveUserData(params) {

	}

	editUser(params) {

	}

	writeData(params) {

	}

	getDeviceInfo(id) {

	}

	registerNewDevice(params) {
		if (params.user_agent && params.browser && params.platform) {
			// creates id
			// adds date & other stuff
			// returns object with that info
		}
	}
}

var test = new BellData();

// example request
// TODO: think about device id's and having associatied devices


// on load

'if device has id';
'POST /api/v1/load';
{
	data: {
		new_load: false,
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

'if device lacks id';
'POST /api/v1/load'
{	
	data: {
		new_load: true,
		device: {
			user_agent: 'thing',
			browser: 'Chrome',
			platform: 'MacIntel',
		}
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


// only do this if already has device_id; otherwise it will record on getting device_id
'POST /api/v1/write/analytics';
{
	data: {
		device_id: 'asJfiej2k3',
		referer: 'https://www.google.com'
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
// then call /api/v1/load to actually then get the data

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
}



// get requests
'GET /api/time';
'GET /api/schedule';
'GET /api/presets';

// bell data schema
schema = {
	hits: [
		{
			new_load: true,
			device_id: 'HJnbG8jDRG',
			date: 1526165118086,
			prefs: {
				theme: 'asdf',
				period: 4,
				period_name: 'history'
			},
			// user agent and browser saved by device
			user: 'ajpat1234@gmail.com',
			referer: 'https://google.com', // referer
		}
	],
	devices: [
		{
			id: 'HJnbG8jDRG',
			user_agent: 'thing',
			browser: 'Chrome',
			platform: 'MacIntel',
			date_registered: 1526165118086,
			registered_to: 'ajpat1234@gmail.com'
		}
	],
	errors: [
		{
			time: 1526165118086,
			user: 'ajpat1234@gmail.com',
			device_id: 'HJnbG8jDRG'
			// needs to be filled out
		}
	],
	users: {
		'ajpat1234@gmail.com': {
			first_name: 'Arjun',
			last_name: 'Patrawala',
			profile_pic: 'https://lh4.googleusercontent.com/-qrlLVeQgbJk/AAAAAAAAAAI/AAAAAAAAAAA/eDsCbPDRjOc/s96-c/photo.jpg',
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
					'default', 'default_reverse' // last being most recent, delete when too long
				]
			},
			devices: {
				'HJnbG8jDRG': 1526165118086 // date added to this profile
			},
			stats: {
				created: 1526165118086,
				viewed_last: 1526165118086,
				updated_period_names: [1526165118086, 1526165189886]
			}
		}
	}
}

module.exports = async (request) => {
	
	// TODO: limit size of any entry into the userData

	return {
		headers: {},
		content: 'you hit the api'
	}

}