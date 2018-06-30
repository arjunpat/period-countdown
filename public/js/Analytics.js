'use strict';

class Analytics {
	constructor() {
		this.sent = false;
	}

	async a() { // checks data values and sends if all are there

		if (this.sent) return;

		let data;
		if (this.pathname === '/' && this.device_id && this.theme && this.period && this.period_name) { // index page

			await this.sleep();
			let speedInfo = window.performance.timing;
			data = {
				device_id: this.device_id,
				pathname: this.pathname,
				referer: window.document.referrer,
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
		} else if (this.pathname && this.device_id && this.theme) {

			await this.sleep();
			let speedInfo = window.performance.timing;
			data = {
				device_id: this.device_id,
				pathname: this.pathname,
				referer: window.document.referrer,
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
				console.log('[Analytics] analytics data sent!');
			}
		});

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