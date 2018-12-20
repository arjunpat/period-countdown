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
			url: '/api/v3/init',
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

	static sendAnalytics(data) {
		return this.ajax({
			url: '/api/v3/write/analytics',
			method: 'POST',
			data: {
				device_id: Storage.getDeviceId(),
				data: data
			}
		}).then(res => res.json);
	}

	static sendLeaveAnalytics() {
		if (navigator.sendBeacon) {

			let data = [
				JSON.stringify({
					device_id: Storage.getDeviceId(),
					data: {}
				})
			]

			let blob = new Blob(data, {
				/*type: 'application/json; charset=UTF-8'*/
			});

			navigator.sendBeacon(URL_PREFIX + '/api/v3/write/close_analytics', blob);
		}
	}

	static getSchoolMeta(school) {
		return this.ajax({
			url: `/api/school/${school}`
		}).then(res => res.json);
	}

	static getSchoolSchedule(school) {
		return this.ajax({
			url: `/api/schedule/${school}`
		}).then(res => res.json);
	}

	static sendError(data) {
		console.error(data);
		return this.ajax({
			url: '/api/v3/write/error',
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