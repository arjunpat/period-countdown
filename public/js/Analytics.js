'use strict';

class Analytics {
	constructor() {
		this.sent = false;
	}

	async a() { // checks data values and sends if all are there

		if (this.sent) return;

		let data;
		if (this.pathname === '/' && this.device_id && this.theme && typeof this.period === 'number' && this.period_name && typeof this.new_load === 'boolean') { // index page

			while (window.performance.timing.loadEventEnd - window.performance.timing.navigationStart < 0) await this.sleep(1);
			await this.sleep(1);
			let speedInfo = window.performance.timing;
			data = {
				pathname: this.pathname,
				referrer: window.document.referrer,
				new_load: this.new_load,
				speed: {
					page_complete: speedInfo.loadEventEnd - speedInfo.navigationStart,
					response_time: speedInfo.responseEnd - speedInfo.requestStart,
					dom_complete: speedInfo.domComplete - speedInfo.domLoading,
					dns: speedInfo.domainLookupEnd - speedInfo.domainLookupStart,
					ttfb: speedInfo.responseStart - speedInfo.navigationStart,
					tti: speedInfo.domInteractive - speedInfo.domLoading
				},
				prefs: {
					theme: this.theme,
					period: this.period
				}
			}
			if (this.period !== this.period_name) data.prefs.period_name = this.period_name;
		} else if (this.pathname && this.device_id && this.theme && typeof this.new_load === 'boolean') {

			while (window.performance.timing.loadEventEnd - window.performance.timing.navigationStart < 0) await this.sleep(1);
			await this.sleep(1);
			let speedInfo = window.performance.timing;
			data = {
				pathname: this.pathname,
				referrer: window.document.referrer,
				new_load: this.new_load,
				speed: {
					page_complete: speedInfo.loadEventEnd - speedInfo.navigationStart,
					response_time: speedInfo.responseEnd - speedInfo.requestStart,
					dom_complete: speedInfo.domComplete - speedInfo.domLoading,
	        		dns: speedInfo.domainLookupEnd - speedInfo.domainLookupStart,
	        		ttfb: speedInfo.responseStart - speedInfo.navigationStart,
	        		tti: speedInfo.domInteractive - speedInfo.domLoading
				},
				prefs: {
					theme: this.theme
				}
			}

		} else return;

		if (this.registered_to) data.registered_to = this.registered_to;

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

	sleep(seconds) {
		this.sent = true;
		return new Promise((resolve, reject) => {
			setTimeout(() => resolve(), seconds * 1e3);
		});
	}
}