'use strict';

class ScheduleBuilder {	
	constructor() {}

	init(presets, calendar) {
		this.presets = presets;
	}

	createNewSchedule(obj) {

		let presets = JSON.parse(JSON.stringify(this.presets));

		for (let key in presets) {
				
		}

	}


	hasInitialized() { return !!this.initialized }
}