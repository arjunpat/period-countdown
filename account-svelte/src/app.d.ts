// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		chrome?: {
			webstore?: any;
			runtime?: any;
		};
		StyleMedia?: any;
		safari?: any;
		opr?: {
			addons?: any;
		};
		opera?: any;
	}

	interface Document {
		documentMode?: any;
	}

	declare var safari: any;
	declare var InstallTrigger: any;
	declare var opr: any;
}

export {};
