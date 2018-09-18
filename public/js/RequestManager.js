import Storage from './Storage.js';

export default class RequestManager {

	static ajax(params) {

		if (!params.method)
			params.method = 'GET';

		let options = {
			method: params.method
		}

		if (params.method === 'POST') {
			options.headers = {
				'Content-Type': 'application/json; charset=UTF-8'
			};
			options.body = JSON.stringify(params.data);
		}

		let startTime = window.performance.now();

		return fetch(params.url, options).then(async response => {
			if (!params.response_type)
				response.json = await response.json();
			else if (params.response_type === 'text')
				response.text = await response.text();

			response.loadTime = window.performance.now() - startTime;

			return response;
		});
	}

	static init() {
		if (Storage.deviceIdExists())
			return this.ajax({
				url: '/api/v1/init',
				method: 'POST',
				data: {
					device_id: Storage.getDeviceId(),
					data: {}
				}
			}).then(res => {

				if (res.json.data.error === 'no_device_exists') {
					Storage.clearAll();
					return this.init();
				}
				
				return res.json.data;
			});
		else {

			let temp = {
				chrome: !!window.chrome,
				int_exp: false || !!document.documentMode,
				edge: !this.int_exp && !!window.StyleMedia,
				safari: /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]" })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification)),
				firefox: typeof InstallTrigger !== 'undefined',
				opera: (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0
			};

			let browser = {};

			for (let val in temp)
				if (temp.hasOwnProperty(val) && temp[val] === true)
					browser[val] = true;

			return this.ajax({
				url: '/api/v1/init',
				method: 'POST',
				data: {
					data: {
						user_agent: window.navigator.userAgent,
						platform: window.navigator.platform,
						browser
					}
				}
			}).then(res => {
				if (res.json.success)
					Storage.setDeviceId(res.json.data.device_id);

				return res.json.data;
			});
		}
	}

	static login(account) {
		return this.ajax({
			url: '/api/v1/write/login',
			method: 'POST',
			data: {
				device_id: Storage.getDeviceId(),
				data: account
			}
		}).then(res => res.json);
	}

	static logout() {
		return this.ajax({
			url: '/api/v1/write/logout',
			method: 'POST',
			data: {
				device_id: Storage.getDeviceId(),
				data: {}
			}
		}).then(res => res.json);
	}

	static sendAnalytics(data) {
		return this.ajax({
			url: '/api/v1/write/analytics',
			method: 'POST',
			data: {
				device_id: Storage.getDeviceId(),
				data: data
			}
		}).then(res => res.json);
	}

	static sendLeaveAnalytics() {
		if (navigator.sendBeacon) {
			navigator.sendBeacon('/api/v1/write/close_analytics', JSON.stringify({
				device_id: Storage.getDeviceId(),
				data: {}
			}));
		}
	}

	static updatePreferences(period_names, theme) {
		return this.ajax({
			url: '/api/v1/update/preferences',
			method: 'POST',
			data: {
				device_id: Storage.getDeviceId(),
				data: {
					period_names,
					theme
				}
			}
		}).then(res => res.json);
	}

	static getTime() {
		return this.ajax({
			url: '/api/time'
		}).then(res => res.json.data.ms + res.loadTime).catch(err => {
			return false;
		});
	}

	static getPresets() {
		return this.ajax({
			url: '/api/presets'
		}).then(res => res.json);
	}

	static getCalendar() {
		return this.ajax({
			url: '/api/calendar'
		}).then(res => res.json);
	}

	static sendError(data) {
		console.error(data);
		return this.ajax({
			url: '/api/v1/write/error',
			method: 'POST',
			data: {
				device_id: Storage.getDeviceId(),
				data: {
					error: `${data.where} | ${data.description}`
				}
			}
		});
	}
}