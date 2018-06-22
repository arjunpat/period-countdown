"use strict";

class BellTimer {

	constructor(presets, calendar) {
		this.calendar = {};
		this.schedule = [];
		this.presets = JSON.stringify(presets);
		this.offset = 0;
		this.stats = {}

		console.time('bellsetup');

		this.parseCalendar(calendar);
		this.prepareSchedule();
		//this.calculateOffset(5);

		console.timeEnd('bellsetup');
		console.log(this.calendar)
		console.log(this.schedule);
	}

	getRemainingTime() {

		let now = this.getCurrentTime();

		if (this.schedule[1].f < now) this.schedule.splice(0, 1);

		// make sure we have at least 2 items in schedule
		while (this.schedule.length < 2) {
			this.addAnotherDayToSchedule();
		}

		let lengthOfPeriod, dist, percent_completed, days, hours, minutes, seconds;

		// calculations
		lengthOfPeriod = this.schedule[1].f - this.schedule[0].f;
		dist = this.schedule[1].f - now;
		percent_completed = Math.floor(100 * (1 - (dist / lengthOfPeriod)));
		days = Math.floor(dist / 864e5); // indep calc
		hours = Math.floor((dist % 864e5) / 36e5) + (days * 24);
		minutes = Math.floor((dist % 36e5) / 6e4);
		seconds = Math.floor((dist % 6e4) / 1e3);

		/*days = Math.floor(distance / (1000 * 60 * 60 * 24)),
		hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) + (days * 24),
		minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
		seconds = Math.floor((distance % (1000 * 60)) / 1000);*/

		return {
			percent_completed,
			days,
			hours,
			minutes,
			seconds,
			period_name: this.schedule[0].n
		}


	}

	prepareSchedule() {
		let dateString = this.getDateStringFromDateObject(new Date());
		this.parseDay(dateString);
		this.stats.parsedUpTo = dateString;

		this.schedule = [].concat(this.calendar[dateString].schedule);

		// account for days with no schedule - weekends and holidays
		while (this.schedule.length === 0) {
			dateString = this.getPreviousDayDateString(dateString);

			this.parseDay(dateString);

			// the concat is not needed, could just be equal
			// used to delete references
			this.schedule = [].concat(this.calendar[dateString].schedule);

		}

		let now = this.getCurrentTime();
		for (let i = 0; i < this.schedule.length - 1;) {
			if (this.schedule[i].f < now && !(this.schedule[i + 1].f > now)) {
				this.schedule.splice(i, 1);
			} else {
				i++;
			}
		}

		// make sure we have at least 2 items in schedule
		while (this.schedule.length < 2) {
			this.addAnotherDayToSchedule();
		}

	}

	parseCalendar(calendar) {

		for (let i = 0; i < calendar.length; i++) {
			let cache = calendar[i];

			if (cache.date) {

				this.calendar[cache.date] = {...cache.content}; // shallow object clone

			} else if (cache.from && cache.to) {

				let date = cache.from;
				let to = this.getNextDayDateString(cache.to);

				do {

					this.calendar[date] = {...cache.content};

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

				let {s, n} = this.getPresetSchedule(type);

				this.calendar[dateString].schedule = s;
				if (!this.calendar[dateString].name) this.calendar[dateString].name = n;
			}

		} else {
			let type = this.getDayTypeFromDateString(dateString);
			this.calendar[dateString] = {};

			let {s, n} = this.getPresetSchedule(type);

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


					this.offset = Math.round(temp / offsets.length); // jic client doesn't like ms w/ decimal
					/*console.log(this.offset);
					console.log(offsets);*/

				});

			}, 1000 * i);
		}

	}

	addAnotherDayToSchedule() {
		this.stats.parsedUpTo = this.getNextDayDateString(this.stats.parsedUpTo);
		this.parseDay(this.stats.parsedUpTo);
		this.schedule = this.schedule.concat(this.calendar[this.stats.parsedUpTo].schedule);
	}

	// helper methods

	getPresetSchedule(type) {
		return JSON.parse(this.presets)[type];
	}

	getCurrentTime() { return this.offset + Date.now(); }

	getDateStringFromDateObject(dateObject) {
		return (dateObject.getMonth() + 1) + '/' + dateObject.getDate() + '/' + dateObject.getFullYear();
	}

	getDateObjectFromDateString(dateString) {
		let a = dateString.split('/');
		return new Date(a[2], parseInt(a[0]) - 1, a[1], 0, 0, 0, 0);
	}

	getNextDayDateString(dateString) {
		return this.getDateStringFromDateObject(new Date(this.getDateObjectFromDateString(dateString).getTime() + 8.64e7));
	}

	getPreviousDayDateString(dateString) {
		return this.getDateStringFromDateObject(new Date(this.getDateObjectFromDateString(dateString).getTime() - 8.64e7));
	}

	getDayTypeFromDateString(dateString) {
		return ['weekend', 'A', 'tutorial', 'B', 'C', 'A', 'weekend'][this.getDateObjectFromDateString(dateString).getDay()];
	}

}