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
				if (err)
					reject(err);

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

		if (device === false)
			return { error: 'no_device_exists' };

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
			'INSERT INTO users (email, first_name, last_name, profile_pic, settings, stats, created_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
			[email, first_name, last_name, profile_pic, empty_obj, empty_obj, Date.now()],
		);

	}

	async createNewDevice(params) {
		let {user_agent, browser, platform} = params;

		// creates id
		let device_id = utils.generateRandomID(20);

		await this.query(
			'INSERT INTO devices (device_id, user_agent, browser, platform, created_time) VALUES (?, ?, ?, ?, ?)',
			[device_id, user_agent, browser, platform, Date.now()]
		);

		return device_id;
	}


	async createNewHit(a) {

		await this.query(
			'INSERT INTO hits (device_id, time, pathname, referrer, school, period, prefs, theme, speed, tti, ttfb, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
			[a.device_id, a.time, a.pathname, a.referrer, a.school, a.period, a.prefs, a.theme, a.speed, a.tti, a.ttfb, a.version]
		);

	}

	async closeHit(device_id) {

		await this.query(
			'UPDATE hits SET leave_time = ? WHERE device_id = ? ORDER BY db_id DESC LIMIT 1',
			[Date.now(), device_id]
		);

	}

	async createNewError(device_id, error) {

		await this.query(
			'INSERT INTO errors (time, device_id, error) VALUES (?, ?, ?)',
			[Date.now(), device_id, error]
		);

	}

	// edit/augment user, devices, etc.

	async registerDevice(device_id, email) {

		// register device in the devices table
		await this.query(
			'UPDATE devices SET registered_to = ?, time_registered = ? WHERE device_id = ?',
			[email, Date.now(), device_id]
		);

	}

	async unregister(device_id, email) {

		await this.query('UPDATE devices SET registered_to = NULL, time_registered = NULL WHERE device_id = ?', [device_id]);

	}

	async updatePreferences(device_id, period_names, theme, school) {

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
			this.setObjectToUser('stats', user.email, user.stats),
			this.query('UPDATE users SET school = ? WHERE email = ?', [school, user.email])
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
