'use strict';

class TimingEngine {

	constructor() {}

	init(presets, calendar) {
		if (this.isInitialized())
			throw 'TimingEngine has already been initialized';

		Logger.time('TimingEngine', 'setup');

		this.calendar = {};
		this.presets = presets;
		this.offset = 0;
		this.schedule = [];
		this.stats = {};

		// parse the calendar arr into a defined interface
		this.parsed = this.parseCalendar(calendar);

		// save the plain parsed version
		this.calendar = this.create(this.parsed);

		// calc offset and run every 15 minutes
		this.calculateOffset();

		// prepare the schedule
		this.prepareSchedule();

		this.initialized = true;
		Logger.timeEnd('TimingEngine', 'setup');
	}

	loadNewPresets(presets) {
		this.checkInit();
		
		Logger.time('TimingEngine', 'new-preset');

		this.calendar = this.create(this.parsed);
		this.presets = presets;
		this.schedule = [];
		this.stats = {};

		this.prepareSchedule();

		Logger.timeEnd('TimingEngine', 'new-preset');

	}

	getRemainingTime() {
		this.checkInit();

		let now = this.getCurrentTime();

		if (this.schedule[1].f < now) this.schedule.splice(0, 1);
		this.makeSureTwoItemsInSchedule();

		let period_length, dist, percent_completed, days, hours, minutes, seconds;

		// calculations
		period_length = this.schedule[1].f - this.schedule[0].f;
		dist = this.schedule[1].f - now;
		percent_completed = 100 * (1 - (dist / period_length));

		if (percent_completed < 0 || percent_completed > 100) { // if offset later figures out that this comp time is way ahead/behind
			this.prepareSchedule();
			return this.getRemainingTime();
		}

		days = Math.floor(dist / 864e5); // indep calc
		hours = Math.floor((dist % 864e5) / 36e5) + (days * 24);
		minutes = Math.floor((dist % 36e5) / 6e4);
		seconds = Math.floor((dist % 6e4) / 1e3);

		/* 
		 * days = Math.floor(distance / (1000 * 60 * 60 * 24)),
		 * hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) + (days * 24),
		 * minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
		 * seconds = Math.floor((distance % (1000 * 60)) / 1000);
		 */

		return {
			percent_completed,
			days,
			hours,
			minutes,
			seconds,
			period: this.schedule[0].n,
			day_type: this.calendar[this.getTodayDateString()].name,
			period_length
		};

	}

	prepareSchedule() {
		this.checkInit();

		this.schedule = []; // always a fresh start

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
			else break;
		}

		this.makeSureTwoItemsInSchedule();

	}

	parseDay(dateString) {
		this.checkInit();

		// makes sure hasn't been parsed before
		if (this.calendar[dateString] && this.calendar[dateString].parsed) return;

		// otherwise
		if (this.calendar[dateString]) {

			if (!this.calendar[dateString].schedule) {

				let {s, n} = this.getPresetSchedule(this.calendar[dateString].type) || this.getPresetScheduleFromDateString(dateString);

				this.calendar[dateString].schedule = s;
				if (!this.calendar[dateString].name) this.calendar[dateString].name = n;

			} else if (!this.calendar[dateString].name)
				this.calendar[dateString].name = this.getPresetScheduleFromDateString(dateString).n;

		} else {
			let {s: schedule, n: name} = this.getPresetScheduleFromDateString(dateString);

			this.calendar[dateString] = {
				schedule,
				name
			};
		}

		// on change of s, the calendar also changes
		let s = this.calendar[dateString].schedule;
	
		// parses the day's s by replacing from with epoch ms time
		for (let i = 0; i < s.length; i++)
			s[i].f = Date.parse(`${dateString} ${s[i].f}:00`);

		this.calendar[dateString].parsed = true;
	}

	parseCalendar(calendar) {
		let parsed = {};

		for (let i = 0; i < calendar.length; i++) {
			let cache = calendar[i];

			if (cache.date) {

				parsed[cache.date] = cache.content;

			} else if (cache.from && cache.to) {

				let date = cache.from;
				let to = this.getNextDayDateString(cache.to);

				do {

					parsed[date] = cache.content;
					date = this.getNextDayDateString(date);

				} while (date !== to);

			}
		}

		return parsed;
	}

	calculateOffset(numOfRequests = 5) {
		this.checkInit();

		Logger.log('TimingEngine', 'calculating offset');

		var offsets = [];
		for (let i = 0; i < numOfRequests; i++) {

			setTimeout(() => RequestManager.getTime().then(time => {
				offsets.push(time - Date.now());

				let temp = 0;
				for (let i = 0; i < offsets.length; i++) temp += offsets[i];

				this.offset = temp / offsets.length;
			}), 1000 * i);
		}

		setTimeout(this.calculateOffset, 900000); // does every 15 minutes
	}

	addAnotherDayToSchedule() {
		this.stats.parsedUpTo = this.getNextDayDateString(this.stats.parsedUpTo);
		this.parseDay(this.stats.parsedUpTo);
		this.schedule = this.schedule.concat(this.calendar[this.stats.parsedUpTo].schedule);
	}


	// helper methods

	makeSureTwoItemsInSchedule() { while (this.schedule.length < 2) this.addAnotherDayToSchedule(); }

	getPresetSchedule(type) { return this.create(this.presets[type]); /* presets are stored in json to delete references */ }

	getPresetScheduleFromDateString(dateString) {
		return this.getPresetSchedule(['weekend', 'A', 'tutorial', 'B', 'C', 'A', 'weekend'][this.getDateObjectFromDateString(dateString).getDay()]);
	}

	getCurrentTime() { return Math.round(this.offset) + Date.now() /* jic client doesn't like ms w/ decimal */ }

	getDateStringFromDateObject(dateObject) {
		return (dateObject.getMonth() + 1) + '/' + dateObject.getDate() + '/' + dateObject.getFullYear();
	}

	getDateObjectFromDateString(dateString) { return new Date(dateString); }

	getNextDayDateString(dateString) {
		return this.getDateStringFromDateObject(new Date(this.getDateObjectFromDateString(dateString).getTime() + 8.64e7));
	}

	getPreviousDayDateString(dateString) {
		return this.getDateStringFromDateObject(new Date(this.getDateObjectFromDateString(dateString).getTime() - 8.64e7));
	}

	getTodayDateString() { return this.getDateStringFromDateObject(new Date(this.getCurrentTime())); }

	create(obj) { return JSON.parse(JSON.stringify(obj)); }

	isInitialized() { return !!this.initialized; }

	checkInit() {
		if (!this.isInitialized)
			throw 'TimingEngine has not been initialized';
	}
}
