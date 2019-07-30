
class Validator {
	constructor(school, schedule) {
		this.errors = {
			school: [],
			schedule: []
		}

		// validation
		for (let preset of schedule.defaults.pattern) {
			if (!school.presets[preset]) {
				this.schoolError(`No preset "${preset}" as mentioned in defaults`);
			}
		}

		for (let item of schedule.calendar) {
			if (!school.presets[item.content.t]) {
				this.schoolError(`No preset "${item.content.t}" as mentioned in calendar`);
			}
		}

		// cleanup
		let now = Date.now() + (3 * 24 * 60 * 60 * 1000); // plus 3 days for extra buffer
		for (; schedule.calendar.length > 0;) {
			let item = schedule.calendar[0];
			if (item.from && item.to) {
				if (Date.parse(item.to) < now) {
					schedule.calendar.splice(0, 1);
					continue;
				} else
					break;
			} else if (item.date) {
				if (Date.parse(item.date) < now) {
					schedule.calendar.splice(0, 1);
					continue;
				}
			}

			break;
		}

		let allMentionedPresets = [...schedule.calendar.map(i => i.content.t), ...schedule.defaults.pattern];
		for (let preset in school.presets) {
			if (!allMentionedPresets.includes(preset)) {
				delete school.presets[preset];
			}
		}

		this.school = school;
		this.schedule = schedule;
	}

	schoolError(text) {
		this.errors.school.push(text);
	}

	scheduleError(text) {
		this.errors.schedule.push(text);
	}

	areErrors() {
		return this.errors.school.length !== 0 || this.errors.schedule.length !== 0;
	}

	getErrors() {
		return this.errors;
	}

	getCleaned() {
		return {
			school: this.school,
			schedule: this.schedule
		}
	}
}


module.exports = Validator;
