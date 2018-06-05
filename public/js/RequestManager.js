"use strict";

class RequestManager {
	constructor() {

	}

	static ajax(params) {

		if (!params.type) params.type = 'GET';

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

	static getTime() {
		return this.ajax({
			url: '/api/time'
		}).then(res => res.json.data.ms + res.loadTime);
	}
}