'use strict';

var Logger = {
	timings: {},
	log_level: 1,
	log: (from, what) => {
		if (!from || !what) throw TypeError('invalid arguments');
		Logger.writeOut(from, what);
	},
	time: (from, action) => {
		if (!from || !action) throw new TypeError('invalid arguments');

		if (Logger.timings[from + action])
			throw "Timing already exists";
		
		Logger.timings[from + action] = {
			start: window.performance.now(),
			from
		}
	},
	timeEnd: (from, action) =>  {
		if (!from || !action) throw new TypeError('invalid arguments');

		if (Logger.timings[from + action]) {
			let time = window.performance.now() - Logger.timings[from + action].start;

			Logger.writeOut(Logger.timings[from + action].from, `${action} took ${time}ms`);

			Logger.timings[from + action] = undefined;
		} else
			throw "Timing does not exist";
	},
	writeOut: (from, text) => {

		if (Logger.log_level === 1)
			console.log(`%c${Logger.getTimeSincePageLoad()} %c[${from}] %c${text}`, 'color: grey', 'color: black; font-weight: bold;', 'color: blue');

	},
	getTimeSincePageLoad: () => {
		let now = window.performance.now();

		let hours = Math.floor(now / (1e3 * 60 * 60));
		now -= hours * 1e3 * 60 * 60;
		hours = (hours > 0) ? `${hours}:` : '';

		let minutes = Math.floor(now / (1e3 * 60));
		now -= minutes * 1e3 * 60;
		minutes = (minutes < 10 && hours > 0) ? `0${minutes}:` : `${minutes}:`;

		let seconds = (now / 1e3).toFixed(2);
		
		seconds = (seconds < 10) ? `0${seconds}` : seconds;

		return hours + minutes + seconds;
	},
	setLogLevel: (num) => {
		Logger.log_level = num;
	}
}