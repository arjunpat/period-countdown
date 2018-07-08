'use strict';

class RequestManager {

	static ajax(params) {

		if (!params.type) params.type = 'GET';
		//params.type = params.type.toUpperCase();

		let options = {
			method: params.type
		}

		if (params.type === 'POST') {
			options.headers = {
				'Content-Type': 'application/json; charset=UTF-8'
			};
			options.body = params.data;
		}

		let startTime = Date.now();

		return fetch(params.url, options).then(async response => {
			if (!params.response_type)
				response.json = await response.json();
			else if (params.response_type === 'text')
				response.text = await response.text();

			response.loadTime = Date.now() - startTime;

			return response;
		});
	}

	static init() {
		if (Storage.deviceIdExists())
			return this.ajax({
				url: '/api/v1/init',
				type: 'POST',
				data: JSON.stringify({
					device_id: Storage.getDeviceId(),
					data: {}
				})
			}).then(res => {

				if (res.json.error === 'no_user_exists') {
					Storage.clearAll();
					return this.init();
				} else return res.json.data;
				
			});
		else {

			let temp = {
				chrome: !!window.chrome,
				int_exp: false || !!document.documentMode,
				edge: !this.int_exp && !!window.StyleMedia,
				safari: /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]" })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification)),
				firefox: typeof InstallTrigger !== 'undefined',
				opera: (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0
			}

			let browser = {}

			for (let val in temp)
				if (temp.hasOwnProperty(val) && temp[val] === true)
					browser[val] = true;

			return this.ajax({
				url: '/api/v1/init',
				type: 'POST',
				data: JSON.stringify({
					data: {
						user_agent: window.navigator.userAgent,
						platform: window.navigator.platform,
						browser
					}
				})
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
			type: 'POST',
			data: JSON.stringify({
				device_id: Storage.getDeviceId(),
				data: account
			})
		}).then(res => res.json);
	}

	static logout() {
		return this.ajax({
			url: '/api/v1/write/logout',
			type: 'POST',
			data: JSON.stringify({
				device_id: Storage.getDeviceId(),
				data: {}
			})
		}).then(res => res.json);
	}

	static sendAnalytics(data) {
		return this.ajax({
			url: '/api/v1/write/analytics',
			type: 'POST',
			data: JSON.stringify({
				device_id: Storage.getDeviceId(),
				data: data
			})
		}).then(res => res.json);
	}

	static updatePeriodNames(values) {

		return this.ajax({
			url: '/api/v1/update/period_names',
			type: 'POST',
			data: JSON.stringify({
				device_id: Storage.getDeviceId(),
				data: values
			})
		}).then(res => res.json);
	}

	static updateTheme(new_theme) {
		return this.ajax({
			url: '/api/v1/update/theme',
			type: 'POST',
			data: JSON.stringify({
				device_id: Storage.getDeviceId(),
				data: { new_theme }
			})
		}).then(res => res.json);
	}

	static getTime() {
		return this.ajax({
			url: '/api/time'
		}).then(res => res.json.data.ms + res.loadTime);
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
		// TODO: do this
		console.error(data);
	}
}
