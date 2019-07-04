
export default class Logger {
	constructor() {
		this.timings = {};
		this.logLevel = 1;
	}
	
	log(from, what) {
		if (!from || !what) throw TypeError('invalid arguments');

		this.writeOut(from, what);
	}

	time(from, action) {
		if (!from || !action) throw new TypeError('invalid arguments');

		if (this.timings[from + action])
			throw "Timing already exists";

		this.timings[from + action] = {
			start: window.performance.now(),
			from
		}
	}

	timingExists(from, action) {
		if (this.timings[from + action])
			return true;
		return false;
	}

	timeEnd(from, action) {
		if (!from || !action) throw new TypeError('invalid arguments');

		if (this.timings[from + action]) {
			let time = window.performance.now() - this.timings[from + action].start;

			this.writeOut(this.timings[from + action].from, `${action} took ${time.toFixed(8)}ms`);

			delete this.timings[from + action];
		} else
			throw "Timing does not exist";
	}

	writeOut(from, text) {
		if (this.logLevel === 1)
			console.log(`%c${this.getTimeSincePageLoad()} %c[${from}] %c${text}`, 'color: grey', 'color: black; font-weight: bold;', 'color: blue');
	}

	getTimeSincePageLoad() {
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
	}

	setLogLevel(num) {
		this.logLevel = num;
	}
}
