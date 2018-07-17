const APP_VERSION = '0.4.2'; // needs to match main.js
/*const FILES = [
	`/`,
	`/js/bundle.js?${APP_VERSION}`,
	`/css/bundle.css?${APP_VERSION}`,
	`/images/1024.png?${APP_VERSION}`,
	`/images/1024_square.png?${APP_VERSION}`,
	`/images/1024.png?${APP_VERSION}`,
	`/manifest.json?${APP_VERSION}`
];*/


// dev
const FILES = [
	`/`,
	`/js/Analytics.js?${APP_VERSION}`,
	`/js/Canvas.js?${APP_VERSION}`,
	`/js/Logger.js?${APP_VERSION}`,
	`/js/main.js?${APP_VERSION}`,
	`/js/PrefManager.js?${APP_VERSION}`,
	`/js/render.js?${APP_VERSION}`,
	`/js/RequestManager.js?${APP_VERSION}`,
	`/js/ScheduleBuilder.js?${APP_VERSION}`,
	`/js/Storage.js?${APP_VERSION}`,
	`/js/TimingEngine.js?${APP_VERSION}`,
	`/js/View.js?${APP_VERSION}`,
	`/css/index.css?${APP_VERSION}`,
	`/css/main.css?${APP_VERSION}`,
	`/css/modal.css?${APP_VERSION}`,
	`/css/not-found.css?${APP_VERSION}`,
	`/css/settings.css?${APP_VERSION}`,
	`/images/1024.png?${APP_VERSION}`,
	`/images/1024_square.png?${APP_VERSION}`,
	`/images/1024.png?${APP_VERSION}`,
	`/manifest.json?${APP_VERSION}`
];

var fileAge = {};

var Logger = {
	logLevel: 1,
	log(what) {
		if (!what)
			throw new TypeError('invalid arguments');

		this.writeOut('ServiceWorker', what);
	},
	writeOut(from, text) {
		if (this.logLevel === 1)
			console.log(`%c[${from}] %c${text}`,'color: black; font-weight: bold;', 'color: blue');
	}
};

this.oninstall = (e) => {
	e.waitUntil(caches.open(APP_VERSION).then(cache => {

		let now = Date.now();
		for (let i = 0; i < FILES.length; i++)
			fileAge[FILES[i]] = now;

		return cache.addAll(FILES);
	}));

	Logger.log('installed v' + APP_VERSION);
	this.skipWaiting();
};

this.onactivate = (e) => {
	e.waitUntil(caches.keys().then(keys => {
		return Promise.all(keys.map(key => {
			if (key !== APP_VERSION) {
				Logger.log('removing files from ' + key);
				return caches.delete(key);
			}
		}));
	}));
	Logger.log('activated')
};

this.onfetch = (e) => {
	let requestClone = e.request.clone();

	e.respondWith(
		fetch(e.request).catch(err => {
			return caches.match(requestClone);
		})
	);
};