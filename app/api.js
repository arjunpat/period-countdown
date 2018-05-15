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

	recordHit(args) {

	}

	createUser(args) {

	}

	retrieveUserData(args) {

	}

	editUser(args) {

	}

	writeData(args) {

	}
}

var test = new BellData();

// example request
// TODO: think about device id's and having associatied devices
// have api call to add a device to a person
// that way, we don't have to load google api library on every load


'POST /api/v1'
var schema = {
	auth: 'ajpat1234@gmail.com',
	request: [
		{
			do: 'update_period_names',
			data: {
				period_0: 'hello'
			}
		},
		{
			do: 'update_theme',
			data: {
				new_theme: 'default_reverse'
			}
		},
		{
			do: 'update_name',
			data: {
				first_name: 'Arjun',

			}
		}
	]
}

// get requests
'GET /api/time';
'GET /api/schedule';
'GET /api/presets'

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
			from: 'https://google.com' // referer
		}
	],
	devices: {
		id: 'HJnbG8jDRG',
		user_agent: 'thing',
		browser: 'Chrome'
	},
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
					'default', 'default_reverse' // last being most recent
				]
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