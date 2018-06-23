'use strict';

class RequestManager {
	
	constructor() {

	}

	static ajax(params) {

		if (!params.type) params.type = 'GET';
		//params.type = params.type.toUpperCase();

		let options = {
			method: params.type
		}

		if (params.type === 'POST') {
			options.headers = new Headers({
				'Content-Type': 'application/json'
			});
			options.body = params.data;
		}

		let startTime = Date.now();

		return fetch(params.url, options).then(async response => {
			response.json = await response.json();

			response.loadTime = Date.now() - startTime;

			return response;
		});
	}

	static sendError(data) {
		// do one day
	}

	static sendAnalytics(data) {
		return this.ajax({
			url: '/api/v1/write/analytics',
			type: 'POST',
			data: JSON.stringify(data)
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
}