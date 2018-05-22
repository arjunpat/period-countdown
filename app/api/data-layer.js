const fs = require('fs');
const utils = require('../utils.js');


// entire thing should be sync so that higher level abstractions can be async

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


module.exports = new BellData();







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