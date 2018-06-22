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
		let dateString = this.getDateStringFromDateObject(new Date());
		this.parseDay(dateString);
		this.stats.parsedUpTo = dateString;

		this.schedule = this.calendar[dateString].schedule;

		// account for days with no schedule - weekends and holidays
		if (this.calendar[dateString].schedule.length === 0) {
			let temp = dateString;

			while (this.schedule.length === 0) {
				temp = this.getLastDayDateString(temp);

				this.parseDay(temp);

				// the concat is not needed, could just be equal
				// used to make sure the this.calendar is not modified later
				this.schedule = [].concat(this.calendar[temp].schedule);

			}
		}

		let now = Date.now();
		for (let i = 0; i < this.schedule.length - 1;) {
			if (this.schedule[i].f < now && !(this.schedule[i + 1].f > now)) {
				this.schedule.splice(i, 1);
			} else {
				i++;
			}
		}

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
				let {type} = cache;

				if (type && this.presets[type.toUpperCase()]) {
					type = type.toUpperCase();
				} else {
					type = this.getDayTypeFromDateString(dateString);
				}

				let {s, n} = this.presets[type];
				this.calendar[dateString].schedule = s;
				if (!this.calendar[dateString].name) this.calendar[dateString].name = n;
			}

		} else {
			let type = this.getDayTypeFromDateString(dateString);
			this.calendar[dateString] = {};

			let {s, n} = this.presets[type];
			this.calendar[dateString].schedule = s;
			if (!this.calendar[dateString].name) this.calendar[dateString].name = n;
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

	getLastDayDateString(dateString) {
		return this.getDateStringFromDateObject(new Date(this.getDateObjectFromDateString(dateString).getTime() - 8.64e7));
	}

	getDayTypeFromDateString(dateString) {
		return ['weekend', 'A', 'tutorial', 'B', 'C', 'A', 'weekend'][this.getDateObjectFromDateString(dateString).getDay()];
	}

}