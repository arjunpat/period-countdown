declare module '../common' {
	export function get(url: string): Promise<any>;
	export function post(url: string, json: any): Promise<any>;
	export function getClientInformation(): any;
	export function generateGoogleSignInLink(): string;
	export function isFreePeriod(name: string): boolean;
}
