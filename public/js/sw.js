const APP_VERSION = '0.4.2'; // needs to match index.html
/*const FILES = [
	`/`,
	`/settings`,
	`/js/bundle.js?v=${APP_VERSION}`,
	`/css/bundle.css?v=${APP_VERSION}`,
	`/images/1024.png?v=${APP_VERSION}`,
	`/images/1024_square.png?v=${APP_VERSION}`,
	`/images/1024.png?v=${APP_VERSION}`,
	`/manifest.json?v=${APP_VERSION}`,
	'/api/presets',
	'/api/calendar'
];*/


// dev
const FILES = [
	`/`,
	`/settings`,
	`/js/Analytics.js?v=${APP_VERSION}`,
	`/js/Canvas.js?v=${APP_VERSION}`,
	`/js/Logger.js?v=${APP_VERSION}`,
	`/js/main.js?v=${APP_VERSION}`,
	`/js/PrefManager.js?v=${APP_VERSION}`,
	`/js/render.js?v=${APP_VERSION}`,
	`/js/RequestManager.js?v=${APP_VERSION}`,
	`/js/ScheduleBuilder.js?v=${APP_VERSION}`,
	`/js/Storage.js?v=${APP_VERSION}`,
	`/js/TimingEngine.js?v=${APP_VERSION}`,
	`/js/View.js?v=${APP_VERSION}`,
	`/css/index.css?v=${APP_VERSION}`,
	`/css/main.css?v=${APP_VERSION}`,
	`/css/modal.css?v=${APP_VERSION}`,
	`/css/not-found.css?v=${APP_VERSION}`,
	`/css/settings.css?v=${APP_VERSION}`,
	`/css/notifications.css?v=${APP_VERSION}`,
	`/css/error.css?v=${APP_VERSION}`,
	`/images/1024.png?v=${APP_VERSION}`,
	`/images/1024_square.png?v=${APP_VERSION}`,
	`/images/1024.png?v=${APP_VERSION}`,
	`/manifest.json?v=${APP_VERSION}`,
	'/api/presets',
	'/api/calendar'
]

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
}

this.oninstall = (e) => {
	e.waitUntil(caches.open(APP_VERSION).then(cache => {
		return cache.addAll(FILES);
	}));

	Logger.log('installed v' + APP_VERSION);
	this.skipWaiting();
}

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
}

this.onfetch = (e) => {
	let requestUrl = new URL(e.request.url);
	let pathname = requestUrl.pathname + requestUrl.search;

	e.respondWith(
		fetch(e.request).then(res => {
			let resClone = res.clone();

			if (FILES.some(val => pathname === val)) {
				console.log('saved', pathname);
				caches.open(APP_VERSION).then( cache => cache.put(pathname, resClone) );
			}

			return res;
		}).catch(err => {

			if (FILES.some(val => pathname === val)) {
				console.log('matched', pathname);
				return caches.match(e.request);
			} else {
				console.log('not matched', pathname);
				return err;
			}

		})
	);
}
