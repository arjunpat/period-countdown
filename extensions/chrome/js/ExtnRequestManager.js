import Storage from '../../../public/js/Storage.js';

export default class ExtnRequestManager {

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

		return fetch(URL_PREFIX + params.url, options).then(async response => {
			if (!params.response_type)
				response.json = await response.json();
			else if (params.response_type === 'text')
				response.text = await response.text();

			response.loadTime = window.performance.now() - startTime;

			return response;
		});
	}

	static init() {
		return this.ajax({
			url: '/api/v1/init',
			method: 'POST',
			data: {
				device_id: Storage.getDeviceId(),
				data: {}
			}
		}).then(res => {
			if (res.json.data.error === 'no_device_exists') {
				return false;
			}

			return res.json.data;
		});
	}

	static getLatestVersion() {
		return this.ajax({
			url: '/api/version'
		}).then(res => res.json.data.version);
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
		}).then(res => {
			chrome.storage.sync.set({
				presets: res.json
			}, () => Logger.log('ExtnRequestManager', 'saved presets in chrome.storage'));

			return res.json
		}).catch(err => {
			return new Promise((resolve, reject) => {
				chrome.storage.sync.get(['presets'], vals => {
					resolve(vals.presets);
				});
			});
		});
	}

	static getCalendar() {
		return this.ajax({
			url: '/api/calendar'
		}).then(res => {
			chrome.storage.sync.set({
				calendar: res.json
			}, () => Logger.log('ExtnRequestManager', 'saved calendar in chrome.storage'));

			return res.json;
		}).catch(err => {
			return new Promise((resolve, reject) => {
				chrome.storage.sync.get(['calendar'], vals => {
					resolve(vals.calendar);
				});
			});
		});
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
			navigator.sendBeacon(URL_PREFIX + '/api/v1/write/close_analytics', JSON.stringify({
				device_id: Storage.getDeviceId(),
				data: {}
			}));
		}
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