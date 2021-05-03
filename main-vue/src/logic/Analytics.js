import { logger } from './init';
import RequestManager from './RequestManager';

export default class Analytics {
	constructor() {
		this.data = {};
		this.sent = false;
	}

	async send() { // checks data values and sends if all are there
		if (this.sent) return;

		let { pathname, version, school, period } = this.data;
		if (!pathname || !version || !school || !period)
			return;

		this.sent = true;

		while (this.getSpeed() === null) {
			await this.sleep(1);
		}

		let data = {
			...this.data,
			...this.getSpeed(),
			referrer: window.document.referrer
		}

		let res = await RequestManager.sendAnalytics(data);

		if (res.success) {
			logger.log('Analytics', 'analytics sent!');
		} else {
			RequestManager.sendError({
				error: 'analytics',
				res
			});
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

	set(key, value) {
		this.data[key] = value;
		this.send();
	}

	leaving() {
		if (this.sent)
			RequestManager.sendLeaveAnalytics();
	}

	sleep(seconds) {
		return new Promise((resolve, reject) => setTimeout(() => resolve(), seconds * 1e3));
	}

	hasSent() {
		return this.sent;
	}
}
