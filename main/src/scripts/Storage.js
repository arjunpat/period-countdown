
export default class Storage {
	static setPrefs(x) {
		if (typeof x !== 'object')
			throw new TypeError('invalid arguments');

		localStorage.prefs = JSON.stringify(x);
	}

	static getPrefs() {
		if (this.prefsExist())
			return JSON.parse(localStorage.prefs);

		return false;
	}

	static prefsExist() {
		return !!localStorage.prefs;
	}

	static clearPrefs() {
		delete localStorage.prefs;
	}

	static chromeExtensionInstalled() {
		return !!localStorage.extension;
	}

	static setChromeExtensionInstalled() {
		localStorage.extension = 'true';
	}

	static clearAll() {
		localStorage.clear();
	}

	static askedAboutNotifications() {
		return !!localStorage.notifications;
	}

	static setAskedAboutNotifications() {
		localStorage.notifications = 'true';
	}
}