'use strict';

class Analytics {
	constructor() {
		this.sent = false;
	}

	async a() { // checks data values and sends if all are there

		if (this.sent) return;

		let data = {};
		if (this.pathname === '/' && this.device_id && typeof this.theme === 'number' && typeof this.period === 'number' && this.period_name && typeof this.new_load === 'boolean') { // index page

			this.sent = true;
			await this.forPerformanceStats();
			data.prefs = {
				theme: this.theme,
				period: this.period
			};
			if (this.period !== this.period_name)
				data.prefs.period_name = this.period_name;

		} else if (this.pathname && this.device_id && typeof this.theme === 'number' && typeof this.new_load === 'boolean') {

			this.sent = true;
			await this.forPerformanceStats();
			data.prefs = {
				theme: this.theme
			}
			
		} else
			return;

		let speedInfo = window.performance.timing;

		data.pathname = this.pathname;
		data.referrer = window.document.referrer;
		data.new_load = this.new_load;
		data.speed = {
			page_complete: speedInfo.loadEventEnd - speedInfo.navigationStart,
			response_time: speedInfo.responseEnd - speedInfo.requestStart,
			dom_complete: speedInfo.domComplete - speedInfo.domLoading,
			dns: speedInfo.domainLookupEnd - speedInfo.domainLookupStart,
			ttfb: speedInfo.responseStart - speedInfo.navigationStart,
			tti: speedInfo.domInteractive - speedInfo.domLoading
		};

		if (this.registered_to)
			data.registered_to = this.registered_to;

		RequestManager.sendAnalytics(data).then(data => {
			if (data.success) {
				Logger.log('Analytics', 'analytics data sent!');
			}
		});

	}

	setNewLoad(x) {
		this.new_load = x;
		this.a();
	}

	setDeviceId(x) {
		this.device_id = x;
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
		this.registered_to = x;
		this.a();
	}

	async forPerformanceStats() {
		while (window.performance.timing.loadEventEnd - window.performance.timing.navigationStart < 0)
			await this.sleep(1);
	}

	sleep(seconds) {
		return new Promise((resolve, reject) => setTimeout(() => resolve(), seconds * 1e3));
	}
}
