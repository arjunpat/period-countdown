import Logger from './Logger';
import { clone } from './extras';

export default class TimingEngine {

	constructor() {}

	init(presets, calendar, weeklyPresets) {
		if (this.initialized)
			throw 'TimingEngine has already been initialized';

		// calc offset and run every 5 minutes
		this.offset = 0;
		this.calculateOffset();

		this._init(presets, calendar, weeklyPresets);

		this.initialized = true;
	}

	loadNewSchedule(presets, calendar, weeklyPresets) {
		this.checkInit();

		Logger.time('TimingEngine', 'new-schedule');

		this._init(presets, calendar, weeklyPresets);

		Logger.timeEnd('TimingEngine', 'new-schedule');
	}

	_init(presets, calendar, weeklyPresets) {
		this.presets = presets;
		this.calendar = this.parseCalendar(calendar);
		this.weeklyPresets = weeklyPresets;
		this.timeline= [];
		this.stats = {};

		if (this.weeklyPresets.length !== 7) {
			throw "Week schedule must include be an array of seven elements";
		}

		this.prepareSchedule();
	}

	getRemainingTime() {
		this.checkInit();

		let now = this.getCurrentTime(),
			periodLength,
			dist,
			percentCompleted,
			days,
			hours,
			minutes,
			seconds;

		if (this.timeline[1].f < now)
			this.timeline.splice(0, 1);
		
		this.ensureTwoItemsInSchedule();

		// calculations
		periodLength = this.timeline[1].f - this.timeline[0].f;
		dist = this.timeline[1].f - now;
		percentCompleted = 100 * (1 - (dist / periodLength));

		if (percentCompleted < 0 || percentCompleted > 100) { // if offset later figures out that this comp time is way ahead/behind
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
			percentCompleted,
			days,
			hours,
			minutes,
			seconds,
			period: this.timeline[0].n,
			dayType: this.calendar[this.getTodayDateString()].name,
			periodLength
		}

	}

	prepareSchedule() {
		this.checkInit();

		this.timeline = []; // always a fresh start

		let dateString = this.getTodayDateString();
		this.prepareDay(dateString);
		this.stats.parsedUpTo = dateString;

		this.timeline = [].concat(this.calendar[dateString].schedule);

		// account for days with no schedule (weekends/holidays) & when first event of day is coming up
		while (this.timeline.length === 0 || this.timeline[0].f > this.getCurrentTime()) {
			dateString = this.getPreviousDayDateString(dateString);

			this.prepareDay(dateString);

			// concat to the front
			this.timeline = [].concat(this.calendar[dateString].schedule, this.timeline);
		}

		// remove all events that have already passed
		let now = this.getCurrentTime();
		while (this.schedule.length > 1 && this.schedule[0].f < now && this.schedule[1].f < now) {
			this.schedule.splice(0, 1);
		}

		this.ensureTwoItemsInSchedule();

	}

	prepareDay(dateString) {
		this.checkInit();

		// makes sure hasn't been prepared before
		if (this.calendar[dateString] && this.calendar[dateString].prepared)
			return;

		// otherwise
		if (this.calendar[dateString]) {

			let {s, n} = this.getPresetSchedule(this.calendar[dateString].type) || this.getPresetScheduleFromDateString(dateString);

			this.calendar[dateString].schedule = s;
			
			if (!this.calendar[dateString].name)
				this.calendar[dateString].name = n;

		} else {
			let {s: schedule, n: name} = this.getPresetScheduleFromDateString(dateString);

			this.calendar[dateString] = {
				schedule,
				name
			}
		}

		// s is reference to object
		let s = this.calendar[dateString].schedule;

		// converts the day's sch to epoch ms time
		for (let i = 0; i < s.length; i++) {
			s[i].f = Date.parse(`${dateString} ${s[i].f}:00`);
		}

		this.calendar[dateString].prepared = true;
	}

	calculateOffset(numOfRequests = 5) {

		let offsets = [];
		for (let i = 0; i < numOfRequests; i++) {

			setTimeout(() => RequestManager.getTime().then(time => {
				if (!time)
					return;

				offsets.push(time - Date.now());

				let temp = 0;
				for (let i = 0; i < offsets.length; i++) temp += offsets[i];

				this.offset = temp / offsets.length;
			}), 1000 * i);
		}

		setTimeout(() => this.calculateOffset(), 5 * 60 * 1000); // does every 5 minutes
	}

	addAnotherDayToSchedule() {
		this.stats.parsedUpTo = this.getNextDayDateString(this.stats.parsedUpTo);
		this.prepareDay(this.stats.parsedUpTo);
		this.timeline = this.timeline.concat(this.calendar[this.stats.parsedUpTo].schedule);
	}


	/* helper methods below */

	parseCalendar(calendar) {
		let parsed = {};

		for (let i = 0; i < calendar.length; i++) {
			let c = calendar[i];

			if (c.date) {

				parsed[c.date] = c.content;

			} else if (c.from && c.to) {

				let date = c.from;
				let to = this.getNextDayDateString(c.to);

				do {

					parsed[date] = c.content;
					date = this.getNextDayDateString(date);

				} while (date !== to);

			}
		}

		return parsed;
	}

	ensureTwoItemsInSchedule() { while (this.timeline.length < 2) this.addAnotherDayToSchedule(); }

	getPresetSchedule(type) { return clone(this.presets[type]); /* presets are stored in json to create new references */ }

	getPresetScheduleFromDateString(dateString) {
		return this.getPresetSchedule(this.weeklyPresets[this.getDateObjectFromDateString(dateString).getDay()]);
	}

	getCurrentTime() { return Math.round(this.offset) + Date.now() /* jic client doesn't like ms w/ decimal */ }

	getDateStringFromDateObject(dateObject) {
		return (dateObject.getMonth() + 1) + '/' + dateObject.getDate() + '/' + dateObject.getFullYear();
	}

	getDateObjectFromDateString(dateString) { return new Date(dateString); }

	getNextDayDateString(dateString) {
		let d = this.getDateObjectFromDateString(dateString);
		d.setDate(d.getDate() + 1);
		return this.getDateStringFromDateObject(d);
	}

	getPreviousDayDateString(dateString) {
		let d = this.getDateObjectFromDateString(dateString);
		d.setDate(d.getDate() - 1);
		return this.getDateStringFromDateObject(d);
	}

	getTodayDateString() { return this.getDateStringFromDateObject(new Date(this.getCurrentTime())); }

	getUpcomingEvents() { return clone(this.timeline); }

	isInitialized() { return !!this.initialized; }

	checkInit() {
		if (!this.isInitialized)
			throw 'TimingEngine has not been initialized';
	}
}
