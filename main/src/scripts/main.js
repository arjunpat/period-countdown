import {
	timingManager,
	prefManager,
	render,
	showPrefs,
	analytics
} from './init';
import RequestManager from './RequestManager';
import Storage from './Storage';
import { removeServiceWorker, greeting, getVersion } from './extras';

// inital preferences before starting timer
timingManager.init(prefManager.getSchoolId());

render();

RequestManager.init().then(data => {
	if (typeof data !== 'object') {
		view.showModal('modal-server-down');
		return;
	}

	if (data.email) {
		prefManager.setGoogleAccount(data);
		render.showPrefs();
	}

	analytics.setTheme(prefManager.getThemeNum());
	analytics.setSchool(prefManager.getSchoolId());
}).catch(err => {	
	RequestManager.sendError(err);
});

analytics.setVersion(getVersion());
analytics.setPathname(window.location.pathname);

window.onbeforeunload = () => {
	analytics.leaving();
}

if (window.location.pathname === '/extn') {
	Storage.setChromeExtensionInstalled();
} else if (window.chrome && !Storage.chromeExtensionInstalled()) {
	setTimeout(() => {
		view.notify('Install the <a style="display: inline;" target="_blank" href="http://bit.ly/bell-extn">Chrome Extension</a>');
	}, 3000);
}

removeServiceWorker();
greeting();

