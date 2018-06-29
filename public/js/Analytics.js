'use strict';

class Analytics {
	constructor() {
		this.sent = false;
	}

	a() { // checks data values and sends if all are there

		let speedInfo = window.performance.timing;
		let data = {
			device_id: this.device_id,
			speed: {
				page_complete: speedInfo.loadEventEnd - speedInfo.navigationStart,
				response_time: speedInfo.responseEnd - speedInfo.requestStart,
				dom_complete: speedInfo.domComplete - speedInfo.domLoading,
				request_length: speedInfo.requestStart - speedInfo.responseEnd,
        		dns: speedInfo.domainLookupEnd - speedInfo.domainLookupStart,
			},
			referer: window.document.referrer
		}

		page_complete: speedInfo.loadEventEnd - speedInfo.navigationStart,

        //responseTime
        responseTime: speedInfo.responseEnd - speedInfo.requestStart,

        //page render time
        domComplete: speedInfo.domComplete - speedInfo.domLoading,

        //dns lookup
        dns: speedInfo.domainLookupEnd - speedInfo.domainLookupStart,

        //time to first byte
        ttfb: speedInfo.responseStart - speedInfo.navigationStart,

        //time to interactive
        tti: speedInfo.domInteractive - speedInfo.domLoading

		if (this.pathname === '/' && this.device_id && this.theme && this.period && this.period_name) { // index page
			data.prefs = {
				theme: this.theme,
				period: this.period
			}
			if (this.period !== this.period_name) data.prefs.period_name = this.period_name;
		} else if (this.pathname && this.device_id && this.theme) {

		//} else if (this.pathname && this.pathname !== '/settings' && this.pathname !== '/' && this.device_id && this.referer && this.theme) {

		} else return;

		if (this.registered_to) data.registered_to = this.registered_to;

		RequestManager.sendAnalytics(data).then(data => {
			if (data.success) {
				this.sent = true;
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
}