import { get, generateGoogleSignInLink } from '../../../../common.js';

export async function checkAuthStatus() {
	try {
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