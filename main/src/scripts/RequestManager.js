import Storage from './Storage';
import { get, post, serverHost, getClientInformation } from '../../../common.js';

export default class RequestManager {

	static init() {
		if (document.cookie.includes('periods_io')) {
			return post('/v4/account', {}).then(res => res.json);
		} else {
			Storage.clearAll(); // clear all old data

			return post('/v4/account', getClientInformation()).then(res => res.json);
		}
	}

	static login(google_token) {
		return post('/v4/login', {
			google_token
		}).then(res => res.json);
	}

	static logout() {
		return post('/v4/logout', {}).then(res => res.json);
	}

	static sendAnalytics(data) {
		return post('/v4/thanks', data).then(res => res.json);
	}

	static sendLeaveAnalytics() {
		if (navigator.sendBeacon) {

			let blob = new Blob(['{}'], {
				type: 'application/json; charset=UTF-8'
			});

			navigator.sendBeacon('/v4/thanks-again', blob);
		}
	}

	static getTime() {
		return get('/time').then(res => res.json.data + res.loadTime).catch(err => {
			return false;
		});
	}

	static getSchoolMeta(school) {
		return get(`/school/${school}`).then(res => res.json);
	}

	static getSchoolSchedule(school) {
		return get(`/schedule/${school}`).then(res => res.json);
	}

	static sendError(data) {
		console.error(data);
		return post('/v4/error', data);
	}
}