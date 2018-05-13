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
		}
	]
}


// bell data schema
schema = {
	hits: [
		{

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