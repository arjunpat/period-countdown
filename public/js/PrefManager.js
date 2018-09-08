import Storage from './Storage.js';

export default class PrefManager {

	constructor() {
		this.initVars();

		this.themeOptions = {
			completed: 	['#fee561','#262626','#d9d9d9','#262626','#262626','#aae6e6','#262626','#e29100','#7bce89'],
			background: ['#fccb0b','#000000','#ffffff','#000000','#000000','#bdffff','#000000','#ffa300','#90e69e'],
			text: 		['#000000','#fccb0b','#000000','#7cfc00','#ff3b9e','#000000','#ff0000','#000000','#000000']
			// Yellow, Yellow on Black, Grey, Green on Black, Purple on Black, Light Blue, Red on Black, Orange, Green
		}

		if (Storage.prefsExist())
			this.setAllPreferences(Storage.getPrefs());
	}

	initVars() {
		this.themeNum = 0;
		this.period_names = {};
		this.google_account = {
			signed_in: false
		}
	}

	getAllPreferences() {

		let free_periods = {};
		for (let i = 0; i <= 7; i++)
			if (this.isFreePeriodGivenContext(this.period_names, i))
				free_periods[i] = true;
			else
				free_periods[i] = false;

		return {
			theme: this.getThemeFromNum(this.themeNum),
			period_names: this.period_names,
			google_account: this.google_account,
			free_periods
		}
	}

	setAllPreferences(values) {
		this.setTheme(values.theme);
		this.period_names = values.period_names;
		this.google_account = values.google_account;
	}

	save() {
		Storage.setPrefs({
			theme: this.themeNum,
			period_names: this.period_names,
			google_account: this.google_account
		});
	}

	// settage and gettage of settings

	setGoogleAccount(values) {
		this.google_account = {
			first_name: values.first_name,
			last_name: values.last_name,
			profile_pic: values.profile_pic,
			email: values.email,
			signed_in: true
		}

		if (values.settings) {
			if (values.settings.period_names)
				this.period_names = values.settings.period_names;
			if (typeof values.settings.theme === 'number')
				this.setTheme(values.settings.theme);
			// do other loading stuff here
		}

		this.save();
	}

	setPreferences(periodValues, theme) {
		if (!this.isLoggedIn())
			return;

		let period_names = {};
		for (let num in periodValues) {
			let name = periodValues[num];

			if (num >= 0 && num <= 7 && typeof name === 'string')
				if (name.length <= 20 && name.length > 0)
					period_names[num] = name;
		}

		if (!this.isValidThemeNum(theme))
			theme = 0;

		return RequestManager.updatePreferences(period_names, theme).then(data => {
			if (data.success) {
				this.setTheme(theme);
				this.period_names = period_names;
				return true;
			} else
				return false;
		});

	}

	setTheme(num) {
		if (!this.isValidThemeNum(num))
			return;

		this.themeNum = num;
		this.save();
	}

	getThemeFromNum(num) {
		return {
			num,
			completed: this.themeOptions.completed[num],
			background: this.themeOptions.background[num],
			text: this.themeOptions.text[num]
		}
	}

	isValidThemeNum(num) {
		if (this.themeOptions.text[num])
			return true;
		return false;
	}


	isFreePeriod(periodName) {
		// some serious ml going on here!
		if (typeof periodName !== 'string')
			return false;

		periodName = periodName.trim().toLowerCase();
		return ['free', 'none', 'nothin'].some(a => periodName.includes(a));
	}

	isFreePeriodGivenContext(context, num) {

		/*
		 * this method only marks a free period as free
		 * if it is consecutive with other free periods at either
		 * the begining of end of the day
		 */

		// sanitize
		context = JSON.parse(JSON.stringify(context))

		for (let key in context)
			context[key] = this.isFreePeriod(context[key]);

		// make sure all periods are not free
		if (!context[num])
			return false;

		if (num === 0 || num === 7)
			return true;

		let isFree = true;
		for (let i = 0; i < num; i++)
			if (!context[i]) {
				isFree = false;
				break;
			}

		if (isFree)
			return isFree;

		for (let i = 7; i > num; i--)
			if (!context[i])
				return false;

		return true;

	}

	getPeriodName(num) { return this.period_names[num] }

	getThemeNum() { return this.themeNum }

	isLoggedIn() { return !!this.google_account.signed_in; }

}