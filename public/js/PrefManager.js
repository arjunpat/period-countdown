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
			// do other loading stuff here
		}

		this.save();
	}

	// period stuff

	setPeriodName(num, name) {
		if (num >= 0 && num <= 7 && typeof name === 'string') {
			if (name.length < 15 && name.length > 0)
				this.period_names[num] = name;
			else if (name.length === 0)
				this.period_names[num] = undefined;
			else
				return false;
			
			this.save();
			return true;
		}
		return false;
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