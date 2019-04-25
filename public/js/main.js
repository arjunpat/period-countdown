import PrefManager from './PrefManager';
import Analytics from './Analytics';
import View from './View';
import RequestManager from './RequestManager';
import Logger from './Logger';
import Storage from './Storage';
import ScheduleBuilder from './ScheduleBuilder';
import TimingEngine from './TimingEngine';

import { render, router, timingManager } from './render';
import { addServiceWorker, googleApiDidLoad, greeting, getVersion } from './extras';


window.timingEngine = new TimingEngine();
window.view = new View();
window.analytics = new Analytics();
window.prefManager = new PrefManager();
window.scheduleBuilder = new ScheduleBuilder();
window.RequestManager = RequestManager;
window.router = router;
window.render = render;

// has to global for google
window.googleApiDidLoad = googleApiDidLoad(render);

// inital preferences before starting timer
timingManager.init(prefManager.getSchoolId());

// inital page render
router(window.location.pathname);

RequestManager.init().then(data => {

	if (typeof data !== 'object') {
		view.showModal('modal-server-down');
		return;
	}

	if (data.email) {
		prefManager.setGoogleAccount(data);
		render.showPrefs();
	}

	if (Storage.deviceIdExists()) {
		analytics.setDeviceId(Storage.getDeviceId());
		analytics.setTheme(prefManager.getThemeNum());
		analytics.setSchool(prefManager.getSchoolId());
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
window.onpopstate = () => router(window.location.pathname);

window.onbeforeunload = () => {
	analytics.leaving();
}


analytics.setVersion(getVersion());
analytics.setPathname(window.location.pathname);

//addServiceWorker('/sw.js');

if (window.chrome && !Storage.chromeExtensionInstalled()) {
	setTimeout(() => {
		view.notify('Install the <a style="display: inline;" target="_blank" href="http://bit.ly/bell-extn">Chrome Extension</a>');
	}, 3000);
}

window.setInterval(() => {
	RequestManager.getLatestVersion().then(version => {
		if (version !== getVersion()) {
			view.notify('Update available: <a onclick="window.location.reload(true)">click</a> to install');
		}
	});
}, 30 * 60 * 1000 /* 30 minutes */);

// welcome, cause what else is the computer going to do?
greeting();
