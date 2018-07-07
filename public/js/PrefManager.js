'use strict';

class PrefManager {
	
	constructor() {
		this.initVars();

		this.theme_options = {
			completed: ['#fee581','#262626','#d9d9d9','#1a1a1a','#1a1a1a'],
			background: ['#fccb0b','#000000','#fff','#000','#000'],
			text: ['#000','#fccb0b','#000','#7cfc00','#ff3b9e'],
			name: ['MVHS Light','MVHS Dark','Grey','Alien Green','Purple']
		}

		if (Storage.prefsExist())
			this.setAllPreferences(Storage.getPrefs());
		else // default prefs
			this.setTheme(0);
	}

	initVars() {
		this.theme = {
			color: {}
		}
		this.period_names = {};
		this.google_account = {
			signed_in: false
		}
	}

	getAllPreferences() {
		return {
			theme: this.theme,
			period_names: this.period_names,
			google_account: this.google_account
		}
	}

	setAllPreferences(values) {
		this.setTheme(values.theme);
		this.period_names = values.period_names;
		this.google_account = values.google_account;
	}

	save() {

		Storage.setPrefs({
			theme: this.theme.num,
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
			// do other loading stuff here
		}

		this.save();
	}

	// period stuff

	setPeriodNames(values) {
		for (let num in values) {
			let name = values[num];

			if (typeof num === 'string')
				num = parseInt(num);

			if (num >= 0 && num <= 7 && typeof name === 'string' && this.isLoggedIn() && this.getPeriodName(num) !== name) {

				if (name.length <= 20 && name.length > 0)
					this.period_names[num] = name;
				else if (name.length === 0)
					delete this.period_names[num];
			}
		}

		return RequestManager.updatePeriodNames(this.period_names).then(data => {
			if (data.success) {
				this.save();
				return true;
			}
			return false;
		});
	}

	getPeriodName(num) {
		return this.period_names[num];
	}

	setTheme(num) {
		this.theme.num = num;
		this.theme.color.completed = this.theme_options.completed[num];
		this.theme.color.background = this.theme_options.background[num];
		this.theme.color.text = this.theme_options.text[num];
		this.theme.name = this.theme_options.name[num];

		if (this.isLoggedIn())
			return RequestManager.updateTheme(this.theme.name).then(data => {
				if (data.success) {
					this.save();
					return true;
				}
				return false;
			});
		else
			this.save();
	}

	setThemeByName(name) {
		return this.setTheme(this.theme_options.name.indexOf(name));
	}

	getThemeName() { return this.theme.name }

	isLoggedIn() {
		return !!this.google_account.signed_in;
	}

}
