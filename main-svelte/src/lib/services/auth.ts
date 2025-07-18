import { get, post, generateGoogleSignInLink, getClientInformation } from '../../../../common.js';

async function initializeSession() {
	try {
		const response = await post('/v4/init', getClientInformation());
		return response.json;
	} catch (error) {
		console.error('Session initialization failed:', error);
		return { success: false };
	}
}

export async function checkAuthStatus() {
	try {
		if (!document.cookie.includes('periods_io')) {
			const { clearAll } = await import('$lib/stores/preferences');
			clearAll();
			
			await initializeSession();
		}

		const response = await get('/v4/account');
		return response.json;
	} catch (error) {
		console.error('Auth check failed:', error);
		return { success: false };
	}
}

export function getSignInUrl() {
	return generateGoogleSignInLink();
}

export function openAccountSettings() {
	window.open('https://account.periods.io/settings', '_blank');
}
