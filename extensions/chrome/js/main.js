import TimingEngine from '../../../public/js/TimingEngine.js';
import Analytics from '../../../public/js/Analytics.js';
import PrefManager from '../../../public/js/PrefManager.js';
import ScheduleBuilder from '../../../public/js/ScheduleBuilder.js';

import Logger from '../../../public/js/Logger.js';
import Storage from '../../../public/js/Storage.js';
window.Logger = Logger;

import View from './ExtnView.js';
import RequestManager from './ExtnRequestManager.js';

window.timingEngine = new TimingEngine(),
window.view = new View();
window.analytics = new Analytics();
window.prefManager = new PrefManager();
window.scheduleBuilder = new ScheduleBuilder();
window.RequestManager = RequestManager;
window.URL_PREFIX = 'http://localhost:8080';
window.VERSION = '2.0.4';

function showPrefs() {
	let prefs = prefManager.getAllPreferences();
	view.applyPreferencesToElements(prefs);
	scheduleBuilder.setFreePeriods(prefs.free_periods);

	if (scheduleBuilder.isNew()) {
		timingEngine.loadNewPresets(scheduleBuilder.generatePresets());
	}

	view.updateScreenDimensions();
}

function mainLoop() {

	let time = timingEngine.getRemainingTime();
	time.period_name = prefManager.getPeriodName(time.period) || time.period;

	view.updateScreen(time);

	return window.setTimeout(mainLoop, 50);
}

Promise.all([RequestManager.getPresets(), RequestManager.getCalendar()]).then(values => {
	let [presets, calendar] = values;

	scheduleBuilder.init(presets, calendar);
	timingEngine.init(scheduleBuilder.generatePresets(), scheduleBuilder.getCalendar());

	showPrefs();
	mainLoop();
	view.hidePreloader();
	Storage.clearAll();
});

chrome.runtime.onMessageExternal.addListener((req, sender, sendResponse) => {
	let { device_id } = req;

	Storage.clearAll();
	if (!device_id) {
		window.open(URL_PREFIX);
	}

	Storage.setDeviceId(device_id);
	RequestManager.init().then(values => {

		if (!values) {
			Storage.clearAll();
			window.open(URL_PREFIX);
		}

		if (values.error !== 'not_registered') {
			analytics.setRegisteredTo(values.email);
			prefManager.setGoogleAccount(values);
		}
		showPrefs();

		let analyticsTime = timingEngine.getRemainingTime();

		analytics.setVersion(VERSION);
		analytics.setPeriod(analyticsTime.period);
		analytics.setPeriodName(prefManager.getPeriodName(analyticsTime.period) || analyticsTime.period);
		analytics.setTheme(prefManager.getThemeNum());
		analytics.setPathname('extn');
		analytics.setDeviceId(Storage.getDeviceId());
	});
});

document.write(`<iframe src="${URL_PREFIX}/extension-connection.html?v=2" style="display: none;"></iframe>`);

view.index.settingsButton.onclick = () => window.open(URL_PREFIX + '/settings');
view.index.googleSignin.querySelector('button').onclick = () => window.open(URL_PREFIX);

window.onbeforeunload = () => {
	// only sometimes will this actually be called
	analytics.leaving();
}


RequestManager.getLatestVersion().then(version => {
	if (version !== VERSION) {
		view.hidePreloader();
		view.switchTo('update-extn');
		document.querySelector('a[href="chrome://extensions"]').onclick = () => chrome.tabs.create({url: 'chrome://extensions'});
	}
});
