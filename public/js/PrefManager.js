'use strict';

class PrefManager {
	
	constructor() {
		this.theme = {
			color: {}
		}
		this.period_names = {};
		this.google_account = {}

		if (window.localStorage.prefs)
			this.setAllPreferences(JSON.parse(window.localStorage.prefs))
		else {
			// default prefs
			this.setTheme(1);
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
		this.theme = values.theme;
		this.period_names = values.period_names;
		this.google_account = values;
	}

	save() {
		window.localStorage.prefs = JSON.stringify(this.getAllPreferences());
	}

	// settage and gettage of settings

	setGoogleAccount(values) {
		this.google_account = {
			first_name: values.first_name,
			last_name: values.last_name,
			profile_pic: values.profile_pic,
			email: values.email
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

			if (num >= 0 && num <= 7 && typeof name === 'string' && this.google_account && this.period_names[num] !== name) {

				if (name.length <= 20 && name.length > 0)
					this.period_names[num] = name;
				else if (name.length === 0)
					this.period_names[num] = undefined;
			}
		}

		RequestManager.updatePeriodNames(this.google_account.email, this.period_names).then(data => {
			if (data.success) {
				this.save();
			} else {
				// tell user it is not saving
			}
		});
	}

	getPeriodName(num) {
		return this.period_names[num];
	}

	setTheme(num) {
		this.theme.num = num;
		this.theme.color.completed = ['#262626','#fee581','#d9d9d9','#1a1a1a','#1a1a1a'][num];
		this.theme.color.background = ['#000000', '#fccb0b','#fff','#000','#000'][num];
		this.theme.color.text = ['#fccb0b','#000','#000','#7cfc00','#c23d80'][num];
		this.theme.name = ['MVHS Dark','MVHS Light','White','Alien Green','Purple'][num];
		this.save();
	}

	getThemeName() { return this.theme.name }

}