'use strict';

class PrefManager {
	
	constructor() {
		this.theme = {
			color: {}
		}
		this.period_names = {}

		if (window.localStorage.prefs)
			this.setAllPreferences(JSON.parse(window.localStorage.prefs))
		else {
			// default prefs
			this.setTheme(0);	
		}
	}

	getAllPreferences() {
		return {
			theme: this.theme,
			period_names: this.period_names
		}
	}

	setAllPreferences(values) {
		this.theme = values.theme;
		this.period_names = values.period_names;
	}

	save() {
		window.localStorage.prefs = JSON.stringify(this.getAllPreferences());
	}

	// period stuff

	setPeriodName(num, name) {
		if (name && name.length < 15 && name.length > 0) {
			this.period_names[`period_${num}`] = name;
			this.save();
			return true;
		}
		return false;
	}

	getPeriodName(num) {
		return this.period_names[`period_${num}`];
	}

	setTheme(num) {
		this.theme.num = num;
		this.theme.color.completed = ['#262626','#fee581','#d9d9d9','#1a1a1a','#1a1a1a'][num];
		this.theme.color.background = ['#000000', '#fccb0b','#fff','#000','#000'][num];
		this.theme.color.text = ['#fccb0b','#000','#000','#7cfc00','#c23d80'][num];
		this.theme.name = ['MVHS Dark','MVHS Light','White','Alien Green','Purple'][num];
		this.save();
	}


}