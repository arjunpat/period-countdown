import Storage from './Storage';
import { get, post, serverHost, getClientInformation } from '../../../common.js';

export default class RequestManager {

	static async init() {
		if (!document.cookie.includes('periods_io')) {
			Storage.clearAll();
			await post('/v4/init', getClientInformation());
		}

		return get('/v4/account').then(res => res.json);
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
		if (navigator.sendBeacon && !window.chrome) { // chrome disabled for some reason

			let blob = new Blob(['{}'], {
				type: 'application/json; charset=UTF-8'
			});

			navigator.sendBeacon(serverHost + '/v4/thanks-again', blob);
		}

		post('/v4/thanks-again', {});
	}

	static notifOn() {
		post('/v4/notif-on', {});
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