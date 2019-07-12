import Storage from './Storage';
import RequestManager from './RequestManager';
import { isFreePeriod } from '../../../common.js';

export default class PrefManager {

	constructor() {
		if (Storage.prefsExist()) {
			this.setAllPreferences(Storage.getPrefs());
		}
		
		this.initVars();
	}

	setAllPreferences(values) {
		this.theme = values.theme;
		this.periodNames = values.periodNames;
		this.googleAccount = values.googleAccount;
		this.school = values.school;
	}

	initVars() {
		// set to default values (school and theme)

		this.theme = this.theme || {
			theme: 0,
			n: 'Yellow gradient',
			b: 'linear-gradient(90deg, #fccb0b, #fc590b)',
			c: 'rgba(70, 0, 70, 0.18)',
			t: '#000'
		}
		this.periodNames = this.periodNames || {};
		this.googleAccount = this.googleAccount;
		this.school = this.school || 'mvhs';
	}

	getAllPreferences() {
		let freePeriods = {};

		for (let key in this.periodNames) {
			freePeriods[key] = isFreePeriod(this.periodNames[key]);
		}

		return {
			theme: this.theme,
			periodNames: this.periodNames,
			googleAccount: this.googleAccount,
			school: this.school,
			schoolOptions: this.schoolOptions,
			freePeriods
		}
	}

	save() {
		Storage.setPrefs({
			theme: this.theme,
			periodNames: this.periodNames,
			googleAccount: this.googleAccount,
			school: this.school
		});
	}
	
	// settage and gettage of settings
	setGoogleAccount(values) {
		this.googleAccount = {
			first_name: values.first_name,
			last_name: values.last_name,
			profile_pic: values.profile_pic,
			email: values.email
		}

		this.periodNames = values.period_names;
		this.theme = values.theme;
		this.school = values.school;

		this.save();
	}

	getPeriodName(num) { return this.periodNames[num]; }

	getThemeNum() { return this.theme.theme; }

	getSchoolId() { return this.school; }

	isLoggedIn() { return !!this.googleAccount; }
}