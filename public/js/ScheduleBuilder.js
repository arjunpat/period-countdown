'use strict';

class ScheduleBuilder {
	constructor() {}

	init(presets, calendar) {
		this.presets = JSON.stringify(presets);
		this.calendar = JSON.stringify(calendar);
		this.initialized = true;
	}

	generatePresets() {

		if (!this.free || Object.keys(this.free).length === 0)
			return JSON.parse(this.presets);

		let presets = JSON.parse(this.presets);

		for (let key in presets) {
			let schedule = presets[key].s;

			for (let i = 0; i < schedule.length; i++) {
				let event = schedule[i];
				if (typeof event.n === 'number')
					if (this.free[event.n])
						schedule.splice(i, 1);
					else
						break;
				schedule.splice(i, 1);
			}

			let lastTime;
			for (let i = schedule.length - 2; i >= 0; i--) { // subtract 2 because last is always free
				let event = schedule[i];
				if (typeof event.n === 'number')
					if (this.free[event.n]) {
						lastTime = event.f;
						schedule.splice(i, 1);
					} else {
						schedule[schedule.length - 1].f = lastTime;
						break;
					}
				schedule.splice(i, 1);
			}

		}

		return presets;
	}

	setFreePeriods(obj) {
		this.free = {};

		for (let key in obj)
			if (obj.hasOwnProperty(key) && typeof obj[key] === 'boolean')
				this.free[key] = obj[key];
	}

	getCalendar() { return JSON.parse(this.calendar) }

	hasInitialized() { return !!this.initialized }
}