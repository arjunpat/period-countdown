import Logger from './Logger.js';

export default class Analytics {
	constructor() {
		this.sent = false;
	}

	async a() { // checks data values and sends if all are there

		if (this.sent) return;

		if (!this.pathname || !this.deviceId || typeof this.theme !== 'number' || typeof this.newLoad !== 'boolean')
			return;

		this.sent = true;
		while (window.performance.timing.loadEventEnd - window.performance.timing.navigationStart < 0)
			await this.sleep(1);

		let data = {};
		if ((this.pathname === '/' || this.pathname === 'extn') && typeof this.period === 'number' && this.period_name) { // index page or extn

			data.prefs = {
				theme: this.theme,
				period: this.period
			}
			if (this.period !== this.period_name)
				data.prefs.period_name = this.period_name;

		} else {
			data.prefs = {
				theme: this.theme
			}
		}

		let speedInfo = window.performance.timing;

		data.pathname = this.pathname;
		data.referrer = window.document.referrer;
		data.new_load = this.newLoad;
		data.speed = {
			page_complete: speedInfo.loadEventEnd - speedInfo.navigationStart,
			response_time: speedInfo.responseEnd - speedInfo.requestStart,
			dom_complete: speedInfo.domComplete - speedInfo.domLoading,
			dns: speedInfo.domainLookupEnd - speedInfo.domainLookupStart,
			ttfb: speedInfo.responseStart - speedInfo.navigationStart,
			tti: speedInfo.domInteractive - speedInfo.domLoading
		};

		if (this.registeredTo)
			data.registered_to = this.registeredTo;

		RequestManager.sendAnalytics(data).then(data => {
			if (data.success) {
				Logger.log('Analytics', 'analytics data sent!');
			}
		});

	}

	setNewLoad(x) {
		this.newLoad = x;
		this.a();
	}

	setDeviceId(x) {
		this.deviceId = x;
		this.a();
	}

	setTheme(x) {
		this.theme = x;
		this.a();
	}

	setPeriod(x) {
		if (x === 'Free') x = -1;
		this.period = x;
		this.a();
	}

	setPeriodName(x) {
		this.period_name = x;
		this.a();
	}

	setPathname(x) {
		this.pathname = x;
		this.a();
	}

	setRegisteredTo(x) {
		this.registeredTo = x;
		this.a();
	}

	sleep(seconds) {
		return new Promise((resolve, reject) => setTimeout(() => resolve(), seconds * 1e3));
	}
}