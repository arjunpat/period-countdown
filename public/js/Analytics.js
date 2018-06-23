'use strict';

class Analytics {
	constructor() {
	}

	a() { // checks data values and sends if all are there

		if (this.device_id && this.referer && this.theme && this.period && this.period_name) {
			let speedInfo = window.performance.timing;
			let data = {
				device_id: this.device_id,
				referer: this.referer,
				speed: {
					dom_interactive: speedInfo.domInteractive - speedInfo.connectStart,
					dom_complete: speedInfo.domComplete - speedInfo.connectStart,
					request_length: speedInfo.requestStart - speedInfo.responseEnd
				},
				prefs: {
					theme: this.theme,
					period: this.period
				}
			}

			if (this.period !== this.period_name) data.prefs.period_name = this.period_name;

			RequestManager.sendAnalytics(data).then(data => {
				if (!data.success) {
					RequestManager.sendError({
						type: 'api',
						description: 'error_sending_analytics'
					});
				}
			});

		}

	}

	setDeviceId(x) {
		this.device_id = x;
		this.a();
	}

	setReferer(x) {
		this.referer = x;
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
}