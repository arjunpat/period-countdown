"use strict";
const fs = require('fs');
const utils = require('../utils.js');


// entire thing should be sync so that higher level abstractions can be async

class BellData {

	constructor(filename) {
		this.users = [];
		this.devices = [];
		this.hits = [];
		this.errors = [];
		this.filename = filename;

		try {
			let {users, devices, hits, errors} = JSON.parse(fs.readFileSync(this.filename).toString());
			this.users = users;
			this.devices = devices;
			this.hits = hits;
			this.errors = errors;

			// indexs arrays to make them much faster and easier to search
			this.user_index = {};
			for (let i = 0; i < this.users.length; i++) this.user_index[this.users[i].email] = i;

			this.devices_index = {};
			for (let i = 0; i < this.devices.length; i++) this.devices_index[this.devices[i].id] = i;

		} catch (e) {
			this.writeDataSync();
		}


	}

	// all the file system methods

	writeDataSync() {
		fs.writeFileSync(this.filename, this.getPreparedData());
	}

	writeDataAsync() {
		fs.writeFile(this.filename, this.getPreparedData(), err => {});
	}

	getPreparedData() {
		return JSON.stringify({
			users: this.users,
			devices: this.devices,
			hits: this.hits,
			errors: this.errors
		});
	}

	// helper methods

	getDeviceIndexById(id) {

		if (this.devices_index[id]) return this.devices_index[id];
		return false;

	}

	getUserIndexByEmail(email) {

		if (this.user_index[email]) return this.user_index[email];
		return false;

	}

	// create user, devices, etc.
	// assumes that other code checks all params to make sure not undefined

	createNewUser(params) {
		let {email, first_name, last_name, profile_pic} = params;

		this.users.push({
			email,
			first_name,
			last_name,
			profile_pic,
			settings: {},
			stats: {
				created: Date.now()
			}
		});

		// adds this id to the index
		this.user_index[email] = this.users.length - 1;

		this.writeDataAsync();

	}

	createNewDevice(params) {
		let {user_agent, browser, platform} = params;

		// creates id
		let id = utils.generateRandomID(10);

		this.devices.push({
			id,
			specs: {
				user_agent,
				browser,
				platform
			},
			date_registered: Date.now()
		});

		// adds this id to the index
		this.devices_index[id] = this.devices.length - 1;

		this.writeDataAsync();

		return id;
	}

	// edit/augment user, devices, etc.

	editUser(params) {

	}

	// get user, devices, etc.

	getUserDataByDeviceId(id) {
		
		let index = getDeviceIndexById(id);

		if (index && this.devices[index].registered_to) return getUserDataByEmail(this.devices[index].registered_to);

		return false;
	}

	getUserDataByEmail(email) {

		let index = getUserIndexByEmail(email);

		if (index && this.users[index] && this.users[index].email === email) {
			let {first_name, last_name, email, profile_pic, settings} = this.users[index];

			return {
				first_name,
				last_name,
				email,
				profile_pic,
				settings
			}

		}

		return false;
	}

	getUserDataByDeviceId(id) {

		let index = getDeviceIndexById(id);

		if (index && this.devices[index] && this.devices[index].id === id) {

			let cache = this.devices[index];

			if (cache.registered_to) {
				let res = getUserDataByEmail(cache.registered_to);
				if (res) {
					res.registered = true;
					return res;
				}
			}

			return { registered: false }

		}

		return false;

	}

	// analytics

	recordHit(params) {

	}
}

module.exports = new BellData((process.env.NODE_ENV === 'production') ? '/home/centos/serve/data/bell_data.json' : './bell_data.json');



// bell data schema
var schema = {
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
			specs: {
				user_agent: 'thing',
				browser: 'Chrome',
				platform: 'MacIntel',
			},
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
	users: [
		{
			email: 'ajpat1234@gmail.com',
			first_name: 'Arjun',
			last_name: 'Patrawala',
			profile_pic: 'https://lh4.googleusercontent.com/-qrlLVeQgbJk/AAAAAAAAAAI/AAAAAAAAAAA/eDsCbPDRjOc/s96-c/photo.jpg',
			settings: {
				period_names: {
					period_0: 'Nothing',
					period_2: 'Journalism',
					period_3: 'Physical Education',
					period_4: 'Bio',
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
	]
}