"use strict";

class BellTimer {

	constructor() {
		this.calendar = {};
		this.schedule = [];
		this.presets = {};
		this.offset = 0;
		this.stats = {}
		

	}

	prepareSchedule() {

	}

	parseCalendar(calendar) {

		for (let i = 0; i < calendar.length; i++) {
			let cache = calendar[i];

			if (cache.date) {

				this.calendar[cache.date] = cache.content;

			} else if (cache.from && cache.to) {

				let date = cache.from;
				let to = this.getNextDayDateString(cache.to);

				do {

					this.calendar[date] = cache.content;

					date = this.getNextDayDateString(date);

				} while (date !== to);

			}
		}
	}

	parseDay(dateString) {
		if (this.calendar[dateString]) {

			// TODO: check if it doesn't have a name
			if (!this.calendar[dateString].schedule) {
				let cache = this.calendar[dateString];
				let {type, name} = cache;

				if (type && this.presets[type.toUpperCase()]) {
					type = type.toUpperCase();
				} else {
					type = this.getDayTypeFromDateString(dateString);
				}

				let {s, n} = this.presets[type];
				this.calendar[dateString].schedule = s;
				if (!name) this.calendar[dateString].name = n;
			}

		} else {
			let type = this.getDayTypeFromDateString(dateString);
			this.calendar[dateString] = {};

			let {s: schedule, n: name} = this.presets[type];
			this.calendar[dateString].schedule = schedule;
			if (!name) this.calendar[dateString].name = name;
		}


		// on change of schedule, the calendar also changes
		let schedule = this.calendar[dateString].schedule;

		// parses the day's schedule by replacing from with epoch ms time
		for (let i = 0; i < schedule.length; i++) {
			schedule[i].f = Date.parse(`${dateString} ${schedule[i].f}:00`);
		}
	}

	calculateOffset(numOfRequests) {

		if (!numOfRequests) throw 'Missing arguments';

		var offsets = [];

		for (let i = 0; i < numOfRequests; i++) {

			setTimeout(() => {

				RequestManager.getTime().then(time => {

					offsets.push(time - Date.now());

					let temp = 0;
					for (let i = 0; i < offsets.length; i++) temp += offsets[i];


					this.offset = Math.round(temp / offsets.length);
					/*console.log(this.offset);
					console.log(offsets);*/

				});

			}, 1000 * i);
		}

	}

	getCurrentTime() { return this.offset + Date.now(); }

	getDateStringFromDateObject(dateObject) {
		return (dateObject.getMonth() + 1) + '/' + dateObject.getDate() + '/' + dateObject.getFullYear();
	}

	getDateObjectFromDateString(dateString) {
		var a = dateString.split('/');
		return new Date(a[2], (parseInt(a[0]) - 1), a[1], 0, 0, 0, 0);
	}

	getNextDayDateString(dateString) {
		return this.getDateStringFromDateObject(new Date(this.getDateObjectFromDateString(dateString).getTime() + 8.64e7));
	}

	getTodayDateString() {
		return this.getDateStringFromDateObject(new Date());
	}

	getDayTypeFromDateString(dateString) {
		return ['weekend', 'A', 'tutorial', 'B', 'C', 'A', 'weekend'][this.getDateObjectFromDateString(dateString).getDay()];
	}

}