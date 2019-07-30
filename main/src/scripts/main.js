import "regenerator-runtime/runtime";

import {
	timingManager,
	prefManager,
	render,
	showPrefs,
	analytics,
	view
} from './init';
import RequestManager from './RequestManager';
import Storage from './Storage';
import { removeServiceWorker, greeting, getVersion, isExtn } from './extras';


// inital preferences before starting timer
timingManager.init(prefManager.getSchoolId());
render();

RequestManager.init().then(json => {
	if (typeof json !== 'object') {
		view.showModal('modal-server-down');
		return;
	}

	if (json.success) {
		prefManager.setGoogleAccount(json.data);
		analytics.setLoggedIn(true);
		showPrefs();
	} else {
		if (Storage.prefsExist()) {
			Storage.clearPrefs();
			location.reload();
		}
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

if (isExtn) {
	Storage.setChromeExtensionInstalled();
} else if (window.chrome && !Storage.chromeExtensionInstalled()) {
	setTimeout(() => {
		view.notify('Install the <a style="display: inline;" target="_blank" href="http://bit.ly/bell-extn">Chrome Extension</a>');
	}, 3000);
}

if (!isExtn && window.Notification && Notification.permission === 'default' && (!Storage.askedAboutNotifications() || Math.random() < .05)) {
	setTimeout(() => {
		// view.showModal('show-notifications');
		view.showModal('Notifications?','We can <span style="font-weight: bold;">notify you when 5 minutes</span> are left of a period!<br><br>To enable notifications, <a id="enable-notifications">click here.</a><br><br>Note: you\'ll only receive these notifications when you have a tab of periods.io open.');

		Storage.setAskedAboutNotifications();
	}, 10000);
}

removeServiceWorker();
greeting();
