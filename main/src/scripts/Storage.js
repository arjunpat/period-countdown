
export default class Storage {
	static setPrefs(x) {
		if (typeof x !== 'object')
			throw new TypeError('invalid arguments');

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

	static chromeExtensionInstalled() {
		return !!window.localStorage.extension;
	}

	static setChromeExtensionInstalled() {
		window.localStorage.extension = 'true';
	}

	static clearAll() {
		window.localStorage.clear();
	}
}