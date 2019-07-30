import RequestManager from './RequestManager';
import { logger } from './init';
import { clone } from './extras';

export default class TimingEngine {

	constructor() {
		this.offset = 0;
		this.calculateOffset();
	}

	init(presets, calendar, defaults) {
		this.presets = presets;
		this.calendar = this.parseCalendar(calendar);
		this.defaults = defaults;
		this.defaults.start = new Date(this.defaults.start).getTime();
		this.timeline = [];
		this.stats = {};

		this.prepareSchedule();
	}

	getRemainingTime() {
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
			dayType: this.calendar[this.getTodayDateString()].n,
			periodLength
		}

	}

	prepareSchedule() {
		this.timeline = []; // always a fresh start

		let dateString = this.getTodayDateString();
		this.prepareDay(dateString);
		this.stats.parsedUpTo = dateString;

		this.timeline = [].concat(this.calendar[dateString].s);

		// account for days with no schedule (weekends/holidays) & when first event of day is coming up
		while (this.timeline.length === 0 || this.timeline[0].f > this.getCurrentTime()) {
			dateString = this.getPreviousDayDateString(dateString);

			this.prepareDay(dateString);

			// concat to the front
			this.timeline = [].concat(this.calendar[dateString].s, this.timeline);
		}

		// remove all events that have already passed
		let now = this.getCurrentTime();
		while (this.timeline.length > 1 && this.timeline[0].f < now && this.timeline[1].f < now) {
			this.timeline.splice(0, 1);
		}

		this.ensureTwoItemsInSchedule();
	}

	prepareDay(dateString) {
		// makes sure hasn't been prepared before
		if (this.calendar[dateString] && this.calendar[dateString].prepared)
			return;

		// otherwise
		if (this.calendar[dateString]) {
			let {s, n} = this.getPresetSchedule(this.calendar[dateString].t) || this.getPresetScheduleFromDateString(dateString);

			this.calendar[dateString].s = s;
			
			if (!this.calendar[dateString].n)
				this.calendar[dateString].n = n;

		} else {
			let {s, n} = this.getPresetScheduleFromDateString(dateString);

			this.calendar[dateString] = {
				s,
				n
			}
		}

		// s is reference to object
		let { s } = this.calendar[dateString];

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

				if (typeof temp === 'number')
					this.offset = temp / offsets.length;
			}), 1500 * i);
		}

		setTimeout(() => this.calculateOffset(), 30 * 60 * 1000); // does every 30 minutes
	}

	addAnotherDayToSchedule() {
		this.stats.parsedUpTo = this.getNextDayDateString(this.stats.parsedUpTo);
		this.prepareDay(this.stats.parsedUpTo);
		this.timeline = this.timeline.concat(this.calendar[this.stats.parsedUpTo].s);
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

	getPresetSchedule(type) {return clone(this.presets[type]);}

	getPresetScheduleFromDateString(dateString) {
		let d = new Date(dateString).getTime();
		d = (d - this.defaults.start) / 86400000;
		d = Math.round(d) % this.defaults.pattern.length;

		return this.getPresetSchedule(this.defaults.pattern[d]);
	}

	getCurrentTime() { return Math.round(this.offset) + Date.now() /* jic client doesn't like ms w/ decimal */ }

	getDateStringFromDateObject(dateObject) {
		return (dateObject.getMonth() + 1) + '/' + dateObject.getDate() + '/' + dateObject.getFullYear();
	}

	getNextDayDateString(dateString) {
		let d = new Date(dateString);
		d.setDate(d.getDate() + 1);
		return this.getDateStringFromDateObject(d);
	}

	getPreviousDayDateString(dateString) {
		let d = new Date(dateString);
		d.setDate(d.getDate() - 1);
		return this.getDateStringFromDateObject(d);
	}

	getTodayDateString() { return this.getDateStringFromDateObject(new Date(this.getCurrentTime())); }

	getUpcomingEvents() { return clone(this.timeline); }
}
