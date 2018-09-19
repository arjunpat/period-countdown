import PrefManager from './PrefManager.js';
import Analytics from './Analytics.js';
import View from './View.js';
import RequestManager from './RequestManager.js';
import Logger from './Logger.js';
import Storage from './Storage.js';
import ScheduleBuilder from './ScheduleBuilder.js';
import TimingEngine from './TimingEngine.js';

import { render, load } from './render.js';
import { addServiceWorker, googleApiDidLoad, greeting, getVersion } from './extras.js';


window.timingEngine = new TimingEngine();
window.view = new View();
window.analytics = new Analytics();
window.prefManager = new PrefManager();
window.scheduleBuilder = new ScheduleBuilder();
window.RequestManager = RequestManager;

// has to global fro google
window.googleApiDidLoad = googleApiDidLoad(render);

// inital page render
load(window.location.pathname);

RequestManager.init().then(data => {

	if (typeof data !== 'object') {
		view.showModal('modal-server-down');
		return;
	}

	if (data.email) {
		prefManager.setGoogleAccount(data);
		render.showPrefs();
		analytics.setRegisteredTo(data.email);
	}

	if (Storage.deviceIdExists()) {
		analytics.setDeviceId(Storage.getDeviceId());
		analytics.setTheme(prefManager.getThemeNum());
	} else {
		view.showModal('modal-server-down');
		throw 'Device id was not established';
	}

	view.fillDeviceIds();
}).catch(err => {	
	RequestManager.sendError({
		where: 'client_page_load',
		description: err.stack
	});
	
	if (!Storage.deviceIdExists()) {
		view.switchTo('error');
	}

});

// makes sure that back and forwards buttons work
window.onpopstate = () => load(window.location.pathname);

window.onbeforeunload = () => {
	analytics.leaving();
}


analytics.setVersion(getVersion());
analytics.setPathname(window.location.pathname);

//addServiceWorker('/sw.js');

if (window.chrome && !window.localStorage.chrome_extension_installed) {
	setTimeout(() => {
		view.notify('Install the <a style="display: inline;" target="_blank" href="https://www.mvhs.club/u/bell-extn">Chrome Extension</a>');
	}, 3000);
}

// make sure computer update to pref changes on other computers
window.setInterval(() => {
	RequestManager.init().then(data => {

		if (data.email) {
			prefManager.setGoogleAccount(data);
			render.showPrefs();
		}
		
	});
}, 5 * 60 * 1000 /* five minutes */);

// welcome, cause what else is the computer going to do?
greeting();