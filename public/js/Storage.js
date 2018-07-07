'use strict';

class Storage {
	
	static setDeviceId(x) {
		if (!x) throw new TypeError('invalid arguments');

		window.localStorage.device_id = x;
	}

	static getDeviceId() {
		return window.localStorage.device_id;
	}

	static deviceIdExists() {
		return !!window.localStorage.device_id;
	}

	static setPrefs(x) {
		if (typeof x !== 'object') throw new TypeError('invalid arguments');

		window.localStorage.prefs = JSON.stringify(x);
	}

	static getPrefs() {
		if (this.prefsExist())
			return JSON.parse(window.localStorage.prefs);
		return false;
	}

	static prefsExist() {
		return !!window.localStorage.prefs;
	}

	static clearAllExceptDeviceId() {
		window.localStorage.removeItem('prefs');
	}

	static clearAll() {
		this.clearAllExceptDeviceId();
		window.localStorage.removeItem('device_id');
	}

}
