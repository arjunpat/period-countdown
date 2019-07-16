import { logger } from './init';
import RequestManager from './RequestManager';

export default class Analytics {
	constructor() {
		this.sent = false;
	}

	async a() { // checks data values and sends if all are there

		if (this.sent) return;

		if (!this.pathname || typeof this.theme !== 'number' || !this.version || !this.school || !this.period || !this.periodName)
			return;

		this.sent = true;

		while (this.getSpeed() === null) {
			await this.sleep(1);
		}

		let data = {};
		if (this.pathname === '/' || this.pathname === '/extn') { // index page or extn
			if (this.loggedIn) {
				data.user = {
					theme: this.theme
				}


				if (this.period !== this.periodName) {
					data.user.period = this.periodName;
				}
			}
		}

		data.pathname = this.pathname;
		data.referrer = window.document.referrer;
		data.school = this.school;
		data.speed = this.getSpeed();
		data.period = this.period;
		data.version = this.version;

		let res = await RequestManager.sendAnalytics(data);

		if (res.success) {
			logger.log('Analytics', 'analytics sent!');
		}

	}

	getSpeed() {
		let timing = window.performance.timing;
		let speed = {
			dns: timing.domainLookupEnd - timing.domainLookupStart,
			dc: timing.domComplete - timing.domLoading,
			pc: timing.loadEventEnd - timing.navigationStart,
			rt: timing.responseEnd - timing.requestStart,
			ttfb: timing.responseStart - timing.navigationStart,
			tti: timing.domInteractive - timing.domLoading
		}

		if (Object.values(speed).some(a => a < 0)) {
			return null;
		}

		return speed;
	}

	setTheme(x) {
		this.theme = x;
		this.a();
	}

	setPeriod(x) {
		this.period = x;
		this.a();
	}

	setPeriodName(x) {
		this.periodName = x;
		this.a();
	}

	setPathname(x) {
		this.pathname = x;
		this.a();
	}

	setVersion(x) {
		this.version = x;
		this.a();
	}

	setSchool(x) {
		this.school = x;
		this.a();
	}

	setLoggedIn(x) {
		this.loggedIn = x;
		this.a();
	}

	leaving() {
		if (this.sent)
			RequestManager.sendLeaveAnalytics();
	}

	sleep(seconds) {
		return new Promise((resolve, reject) => setTimeout(() => resolve(), seconds * 1e3));
	}
}
