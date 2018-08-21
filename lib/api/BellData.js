'use strict';
const mysql = require('mysql');
const utils = require('../utils.js');

class BellData {

	constructor(user, password, database, host) {
		this.conn = mysql.createConnection({
			user,
			password,
			database,
			host
		});

		this.query = (sql, vals) => new Promise((resolve, reject) => {
			this.conn.query(sql, vals, (err, res) => {
				if (err) reject(err);
				resolve(res);
			})
		});
	}

	// helper methods

	getUserByEmail(email) {
		if (!email) throw new TypeError('invalid arguments');

		return this.query('SELECT * FROM users WHERE email = ?', [email]).then(results => {
			if (results.length !== 1) return false;
			let user = results[0];
			user.stats = (user.stats.length > 0) ? JSON.parse(user.stats) : {};
			user.settings = (user.settings.length > 0) ? JSON.parse(user.settings) : {};
			user.devices = (user.devices.length > 0) ? JSON.parse(user.devices) : {};

			return user;
		});

	}

	getDeviceByDeviceId(device_id) {
		if (!device_id) throw new TypeError('invalid arguments');

		return this.query('SELECT * FROM devices WHERE device_id = ?', [device_id]).then(result => {
			if (result.length !== 1) return false;
			return result[0];
		});

	}

	setObjectToUser(what, email, object) {
		if (typeof what !== 'string' || typeof email !== 'string' || typeof object !== 'object') throw new TypeError('invalid arguments');

		return this.query(
			`UPDATE users SET ${what} = ? WHERE email = ?`,
			[JSON.stringify(object), email]
		);

	}

	async getUserByDeviceId(device_id) {

		let device = await this.getDeviceByDeviceId(device_id);

		if (device === false) return { error: 'no_device_exists' };

		if (device.registered_to)
			return await this.getUserByEmail(device.registered_to);

		return { error: 'not_registered' };

	}

	userExists(email) {
		return this.query('SELECT * FROM users WHERE email = ?', [email]).then(results => {
			if (results.length === 1) return true;
			return false;
		});
	}

	isThisMe(a, b) {

		for (let val of ['profile_pic', 'email', 'first_name', 'last_name'])
			if (a[val] !== b[val]) return false;
		return true;
	}

	// create user, devices, etc.
	// assumes that other code checks all params to make sure not undefined

	async createNewUser(params) {
		let {email, first_name, last_name, profile_pic} = params;

		let empty_obj = '{}';

		await this.query(
			'INSERT INTO users (email, first_name, last_name, profile_pic, settings, devices, stats, created_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
			[email, first_name, last_name, profile_pic, empty_obj, empty_obj, empty_obj, Date.now()],
		).then(results => console.log(results)).catch(err => console.log(err));

	}

	async createNewDevice(params) {
		let {user_agent, browser, platform} = params;

		// creates id
		let device_id = utils.generateRandomID(20);

		await this.query(
			'INSERT INTO devices (device_id, user_agent, browser, platform, date_registered) VALUES (?, ?, ?, ?, ?)',
			[device_id, user_agent, browser, platform, Date.now()]
		).then(results => console.log(results)).catch(err => console.log(err));

		return device_id;
	}


	async createNewHit(a) {

		await this.query(
			'INSERT INTO hits (device_id, time, pathname, referrer, new_load, period, prefs, theme, speed, tti, ttfb) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
			[a.device_id, a.time, a.pathname, a.referrer, a.new_load, a.period, a.prefs, a.theme, a.speed, a.tti, a.ttfb]
		);

		await this.query(
			'UPDATE devices SET last_view_time = ? WHERE device_id = ?',
			[a.time, a.device_id]
		);

		if (a.user)
			await this.query(
				'UPDATE users SET last_view_time = ? WHERE email = ?',
				[a.time, a.user]
			);
	}

	async createNewError(device_id, error, user) {

		await this.query(
			'INSERT INTO errors (device_id, error, user) VALUES (?, ?, ?)',
			[device_id, error, user]
		);

	}

	// edit/augment user, devices, etc.

	async registerDevice(device_id, email) {

		let user = await this.getUserByEmail(email);

		// register device in the devices table

		let a = this.query(
			'UPDATE devices SET registered_to = ? WHERE device_id = ?',
			[email, device_id]
		);

		// register in users

		user.devices[device_id] = Date.now();

		let b = this.setObjectToUser('devices', email, user.devices);

		await Promise.all([a, b]);

	}

	async unregister(device_id, email) {

		let user = await this.getUserByEmail(email);

		delete user.devices[device_id];

		let a = this.query('UPDATE devices SET registered_to = NULL WHERE device_id = ?', [device_id]);
		let b = this.setObjectToUser('devices', email, user.devices);

		await Promise.all([a, b]);

	}

	async updatePreferences(device_id, period_names, theme) {

		let user = await this.getUserByDeviceId(device_id);

		if (user.error)
			return { error: user.error };

		user.settings = {
			period_names,
			theme
		}

		let now = Date.now();
		let arr = user.stats;

		// if last period update was within the last 5 minutes, save stat as one
		if (typeof arr.updated_settings === 'object') {

			// period name stats
			if (arr.updated_settings.length > 8)
				arr.updated_settings = utils.removeEveryOtherElementFromArray(arr.updated_settings, 1);

			for (let i = arr.updated_settings.length - 1; i >= 0; i--)
				if (now - 300000 < arr.updated_settings[i])
					arr.updated_settings.splice(i, 1);
				else
					break;
		} else {
			arr.updated_settings = [];
		}

		arr.updated_settings.push(now);

		await Promise.all([
			this.setObjectToUser('settings', user.email, user.settings),
			this.setObjectToUser('stats', user.email, user.stats)
		]);

		return {};

	}

	updateUser(vals) {
		return this.query(
			'UPDATE users SET first_name = ?, last_name = ?, profile_pic = ? WHERE email = ?',
			[vals.first_name, vals.last_name, vals.profile_pic, vals.email]
		);
	}
}

module.exports = BellData;
