import { writable } from 'svelte/store';

export interface Theme {
	n: string; // Theme name
	b: string; // Background gradient
	c: string; // Progress bar color
	t: string; // Text color
}

export interface GoogleAccount {
	first_name: string;
	last_name: string;
	profile_pic: string;
	email: string;
}

export interface Preferences {
	theme: Theme;
	screenWidth: number;
	screenHeight: number;
	googleAccount?: GoogleAccount;
	periodNames?: Record<string, string>;
	school?: string;
	rooms?: Record<string, any>;
}

const defaultPreferences: Preferences = {
	theme: {
		n: 'Yellow',
		b: 'linear-gradient(90deg, #fccb0b, #fc590b)',
		c: 'rgba(0,0,0,0.1)',
		t: '#000'
	},
	screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
	screenHeight: typeof window !== 'undefined' ? window.innerHeight : 1080
};

export const preferences = writable<Preferences>(defaultPreferences);

export function updateTheme(theme: Theme) {
	preferences.update((prefs) => ({
		...prefs,
		theme
	}));
}

export function updatePreferences(newPreferences: Partial<Preferences>) {
	preferences.update((prefs) => ({
		...prefs,
		...newPreferences
	}));
}

export function updateScreenDimensions(width: number, height: number) {
	preferences.update((prefs) => ({
		...prefs,
		screenWidth: width,
		screenHeight: height
	}));
}

export function setGoogleAccount(data: any) {
	preferences.update((prefs) => ({
		...prefs,
		googleAccount: {
			first_name: data.first_name,
			last_name: data.last_name,
			profile_pic: data.profile_pic,
			email: data.email
		},
		periodNames: data.period_names,
		theme: data.theme || prefs.theme,
		school: data.school,
		rooms: data.rooms
	}));
}

export function clearAuth() {
	preferences.update((prefs) => ({
		...prefs,
		googleAccount: undefined,
		periodNames: undefined,
		school: undefined,
		rooms: undefined
	}));
}
