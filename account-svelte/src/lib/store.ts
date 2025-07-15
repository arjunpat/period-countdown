import { writable, get as getStore } from 'svelte/store';
import { get, post } from './api';
import { generateGoogleSignInLink } from '../../../common';

export const email = writable('');
export const profile_pic = writable('');
export const school = writable('');
export const admin = writable(false);
export const periods = writable([]);
export const schools = writable([]);
export const themes = writable([]);
export const themeNum = writable(0);
export const first_name = writable('');
export const last_name = writable('');
export const meetingLinks = writable({});
export const periodNames = writable({});
export const loading = writable(true);

export function setAccount(data) {
	email.set(data.email || '');
	profile_pic.set(data.profile_pic || '');
	school.set(data.school || '');
	admin.set(data.admin || false);
	themeNum.set(data.theme?.theme || 0);
	first_name.set(data.first_name || '');
	last_name.set(data.last_name || '');

	// Handle meeting links from rooms
	const newMeetingLinks = {};
	if (data.rooms) {
		for (const key in data.rooms) {
			if (data.rooms[key] && data.rooms[key].type === 'url') {
				newMeetingLinks[key] = data.rooms[key].url;
			}
		}
	}
	meetingLinks.set(newMeetingLinks);

	// Handle period names
	periodNames.set(data.period_names || {});
}

export async function loadUser() {
	loading.set(true);

	try {
		const res = await get('/v4/account');

		if (res.success) {
			setAccount(res.data);
		} else {
			window.location.href = generateGoogleSignInLink();
		}
	} catch (e) {
		console.error('Network error while loading user:', e);
	} finally {
		loading.set(false);
	}
}

export async function loadPeriods(schoolName) {
	if (!schoolName) return;
	const res = await get(`/periods/${schoolName}`);
	periods.set(res);
}

export async function loadSchools() {
	const res = await get('/schools');
	schools.set(res);
}

export async function loadThemes() {
	const res = await get('/themes');
	themes.set(res);
}

export function setPeriodName(periodName, value) {
	periodNames.update((names) => ({
		...names,
		[periodName]: value
	}));
}

export function setMeetingLink(periodName, url) {
	meetingLinks.update((links) => {
		const newLinks = { ...links };
		if (url && url.trim()) {
			newLinks[periodName] = url;
		} else {
			delete newLinks[periodName];
		}
		return newLinks;
	});
}

export function setSchool(schoolName) {
	school.set(schoolName);
}

export function setThemeNum(themeNumber) {
	themeNum.set(themeNumber);
}

export async function saveSettings() {
	loading.set(true);

	try {
		const $periodNames = getStore(periodNames);
		const $periods = getStore(periods);
		const $meetingLinks = getStore(meetingLinks);

		for (const key in $periodNames) {
			if (!$periods.includes(key) || !$periodNames[key]) {
				delete $periodNames[key];
			} else {
				$periodNames[key] = $periodNames[key].trim();
			}
		}

		const rooms = {};
		for (const key in $meetingLinks) {
			rooms[key] = {
				type: 'url',
				url: $meetingLinks[key]
			};
		}

		const res = await post('/v4/update-preferences', {
			period_names: $periodNames,
			theme: getStore(themeNum),
			school: getStore(school),
			rooms
		});

		if (!res.success) {
			console.error('Failed to save settings');
		}
	} catch (e) {
		console.error('Network error while saving settings:', e);
	} finally {
		loading.set(false);
	}
}
