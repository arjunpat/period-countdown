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
			if (!presets.hasOwnProperty(key))
				continue;

			let schedule = presets[key].s;

			while (schedule.length > 0) {
				let event = schedule[0];
				if (typeof event.n === 'number' && !this.free[event.n])
					break;
				else
					schedule.splice(0, 1);
			}

			var lastTime;
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
				else
					schedule.splice(i, 1);
			}

		}

		this.new = false;
		return presets;
	}

	setFreePeriods(obj) {
		let firstRun = false;
		
		if (!this.free) {
			firstRun = true;
			this.free = {};
		}

		for (let key in obj)
			if (obj.hasOwnProperty(key) && typeof obj[key] === 'boolean' && this.free[key] !== obj[key]) {
				this.free[key] = obj[key];
				this.new = true;
			}
		
		if (firstRun && Object.keys(this.free).find(key => this.free[key] === true))
			this.new = false;
		
		// make sure not all periods are free
		if (Object.keys(this.free).find(key => this.free[key] === false)) {
			// TODO
		}
	}

	isNew() { return !!this.new && this.isInitialized(); }

	getCalendar() { return JSON.parse(this.calendar); }

	isInitialized() { return !!this.initialized; }
}