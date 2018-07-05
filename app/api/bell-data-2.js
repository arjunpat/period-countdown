'use strict';
const mysql = require('mysql');
const utils = require('../utils.js');

// entire thing should be sync so that higher level abstractions can be async

class BellData {

	constructor() {
		this.conn = mysql.createConnection({
			host: '127.0.0.1',
			user: 'bell_user',
			password: 'ABEqUJHEAyPkdeV3sE8TBeDFL',
			database: 'bell_data'
		});

		this.query = (sql, vals) => new Promise((resolve, reject) => {
			this.conn.query(sql, vals, (err, res) => {
				if (err) reject(err);
				resolve(res);
			})
		});
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

	getDeviceIndexByDeviceId(id) {

		if (typeof this.devices_index[id] === 'number') return this.devices_index[id];
		return false;

	}

	getUserByEmail(email) {

		return this.query('SELECT * FROM users WHERE email = ?', [email]);

	}

	getUserIndexByDeviceId(id) {
		let index = this.getDeviceIndexByDeviceId(id);

		if (index !== false && this.devices[index] && this.devices[index].registered_to) {
			index = this.getUserIndexByEmail(this.devices[index].registered_to);
			if (index !== false && this.users[index])
				return index;
		}

		return false;
	}

	// create user, devices, etc.
	// assumes that other code checks all params to make sure not undefined

	createNewUser(params) {
		let {email, first_name, last_name, profile_pic} = params;

		let empty_obj = JSON.stringify({});
		let stats = JSON.stringify({
			created: Date.now()
		})

		this.query(
			'INSERT INTO users (email, first_name, last_name, profile_pic, settings, devices, stats) VALUES (?, ?, ?, ?, ?, ?, ?)',
			[email, first_name, last_name, profile_pic, empty_obj, empty_obj, stats],
		).then(results => console.log(results)).catch(err => console.log(err));

	}

	createNewDevice(params) {
		let {user_agent, browser, platform} = params;

		// creates id
		let device_id = utils.generateRandomID(10);

		if (typeof browser === 'object') {
			if (browser.length === 0)
				browser = 'unknown';
			else
				browser = browser[0];
		}

		this.query(
			'INSERT INTO devices (device_id, user_agent, browser, platform, date_registered) VALUES (?, ?, ?, ?, ?)',
			[device_id, user_agent, browser, platform, Date.now()]
		).then(results => console.log(results)).catch(err => console.log(err));

		return id;
	}

	// edit/augment user, devices, etc.

	registerDevice(id, email) {

		// register device in the devices table

		this.query(
			'UPDATE devices SET registered_to = ? WHERE device_id = ?',
			[email, id]
		).then(results => console.log(results)).catch(err => console.log(err));


		// register device in the users table

		// TODO



	}

	updatePeriodNames(device_id, values) {
		let index = this.getUserIndexByDeviceId(device_id);

		if (index !== false && this.users[index]) {

			let user = this.users[index];

			user.settings.period_names = values;

			this.writeDataSync();

			return {};
		}

		return { error: 'no_user_exists' };

	}

	updateUser(vals) {
		let index = this.getUserIndexByEmail(vals.email);

		if (index !== false && this.users[index]) {
			let user = this.users[index];

			user.first_name = vals.first_name;
			user.last_name = vals.last_name;
			user.profile_pic = vals.profile_pic;

			this.writeDataSync();
		}
	}

	// get user, devices, etc.

	getUserDataByEmail(email) {

		let index = this.getUserIndexByEmail(email);

		if (index !== false && this.users[index] && this.users[index].email === email)
			return this.users[index];

		return { error: 'no_user_exists' };
	}

	getUserDataByDeviceId(id) {

		let index = this.getDeviceIndexByDeviceId(id);

		if (index !== false && this.devices[index] && this.devices[index].id === id) {

			let cache = this.devices[index];

			if (cache.registered_to) {
				let res = this.getUserDataByEmail(cache.registered_to);
				if (res) return res;
			}

			return { registered: false }

		}

		return { error: 'no_user_exists' };

	}

	isThisMe(a, b) {

		for (let val of ['profile_pic', 'email', 'first_name', 'last_name'])
			if (a[val] !== b[val]) return false;
		return true;
	}

	// analytics

	recordHit(params) {

	}
}

module.exports = new BellData();