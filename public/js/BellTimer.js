'use strict';

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
		/*console.log(this.calendar)
		console.log(this.schedule);*/
	}

	getRemainingTime() {

		let now = this.getCurrentTime();

		if (this.schedule[1].f < now) this.schedule.splice(0, 1);

		this.makeSureTwoItemsInSchedule();

		let lengthOfPeriod, dist, percent_completed, days, hours, minutes, seconds;

		// calculations
		lengthOfPeriod = this.schedule[1].f - this.schedule[0].f;
		dist = this.schedule[1].f - now;
		percent_completed = 100 * (1 - (dist / lengthOfPeriod));
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
			period_name: this.schedule[0].n,
			day_type: this.calendar[this.getTodayDateString()].name
		}

	}

	prepareSchedule() {
		let dateString = this.getTodayDateString();
		this.parseDay(dateString);
		this.stats.parsedUpTo = dateString;

		this.schedule = [].concat(this.calendar[dateString].schedule);

		// account for days with no schedule (weekends/holidays) & when first event of day is coming up
		while (this.schedule.length === 0 || this.schedule[0].f > this.getCurrentTime()) {
			dateString = this.getPreviousDayDateString(dateString);

			this.parseDay(dateString);

			// concat to the front
			this.schedule = [].concat(this.calendar[dateString].schedule, this.schedule);
		}

		// remove all events that have already passed
		let now = this.getCurrentTime();
		for (let i = 0; i < this.schedule.length - 1;) {
			if (this.schedule[0].f < now && !(this.schedule[1].f > now))
				this.schedule.splice(0, 1);
			else
				break;
		}

		this.makeSureTwoItemsInSchedule()

	}

	parseCalendar(calendar) {
		for (let i = 0; i < calendar.length; i++) {
			let cache = calendar[i];
			cache.content = JSON.stringify(cache.content);

			if (cache.date) {

				this.calendar[cache.date] = JSON.parse(cache.content); // TODO: find better way

			} else if (cache.from && cache.to) {

				let date = cache.from;
				let to = this.getNextDayDateString(cache.to);

				do {

					this.calendar[date] = JSON.parse(cache.content);

					date = this.getNextDayDateString(date);

				} while (date !== to);

			}
		}
	}

	parseDay(dateString) {
		if (this.calendar[dateString]) {

			// TODO: check if it doesn't have a name
			if (!this.calendar[dateString].schedule) {

				let {s, n} = this.getPresetSchedule(this.calendar[dateString].type) || this.getPresetScheduleFromDateString(dateString);

				this.calendar[dateString].schedule = s;
				if (!this.calendar[dateString].name) this.calendar[dateString].name = n;
			} else if (!this.calendar[dateString].name) {
				this.calendar[dateString].name = this.getPresetScheduleFromDateString(dateString).n;
			}

		} else {
			let {s: schedule, n: name} = this.getPresetScheduleFromDateString(dateString);

			this.calendar[dateString] = {
				schedule,
				name
			}
		}

		// on change of s, the calendar also changes
		let s = this.calendar[dateString].schedule;

		// parses the day's s by replacing from with epoch ms time
		for (let i = 0; i < s.length; i++) {
			s[i].f = Date.parse(`${dateString} ${s[i].f}:00`);
		}
	}

	calculateOffset(numOfRequests) {

		if (!numOfRequests) throw 'Missing arguments';

		var offsets = [];

		for (let i = 0; i < numOfRequests; i++) {

			setTimeout(() =>

				RequestManager.getTime().then(time => {

					offsets.push(time - Date.now());

					let temp = 0;
					for (let i = 0; i < offsets.length; i++) temp += offsets[i];


					this.offset = Math.round(temp / offsets.length); // jic client doesn't like ms w/ decimal
					/*console.log(this.offset);
					console.log(offsets);*/

				}), 1000 * i);
		}

	}

	addAnotherDayToSchedule() {
		this.stats.parsedUpTo = this.getNextDayDateString(this.stats.parsedUpTo);
		this.parseDay(this.stats.parsedUpTo);
		this.schedule = this.schedule.concat(this.calendar[this.stats.parsedUpTo].schedule);
	}

	// helper methods

	makeSureTwoItemsInSchedule() { while (this.schedule.length < 2) this.addAnotherDayToSchedule(); }

	getPresetSchedule(type) { return JSON.parse(this.presets)[type]; /* presets are stored in json to delete references */ }

	getPresetScheduleFromDateString(dateString) {
		return this.getPresetSchedule(['weekend', 'A', 'tutorial', 'B', 'C', 'A', 'weekend'][this.getDateObjectFromDateString(dateString).getDay()]);
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

	getTodayDateString() { return this.getDateStringFromDateObject(new Date()) }
}