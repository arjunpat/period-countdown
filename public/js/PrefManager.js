import Storage from './Storage.js';

export default class PrefManager {

	constructor() {
		this.initVars();

		this.themeOptions = [
			// [background, completed, text]
			['#fccb0b', '#fee561', '#000000'], // Yellow
			['#000000', '#262626', '#fccb0b'], // Yellow on Black
			['#ffffff', '#d9d9d9', '#000000'], // Grey
			[ // Blue-green gradient
				{
					type: 'linear_gradient',
					stops: ['#40e078', '#40c8e6']
				},
				'rgba(0, 0, 0, .18)',
				'#000'
			],
			[ // Pink-blue gradient
				{
					type: 'linear_gradient',
					stops: ['#FC5C7D', '#6A82FB']
				},
				'rgba(0, 0, 0, .18)',
				'#000'
			],
			['#bdffff', '#aae6e6', '#000000'], // Light Blue
			['#000000', '#262626', '#ff2a00'], // Red on Black
			[
				{
					type: 'linear_gradient',
					stops: ['#F3904F', '#3B4371']
				},
				'rgba(0, 0, 0, .18)',
				'#000'
			], // Sunrise Gradient
			['#90e69e', '#7bce89', '#000000'], // Green
		]

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
			background: this.themeOptions[num][0],
			completed: this.themeOptions[num][1],
			text: this.themeOptions[num][2]
		}
	}

	isValidThemeNum(num) {
		if (this.themeOptions[num])
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