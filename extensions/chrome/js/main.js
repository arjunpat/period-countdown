import TimingEngine from '../../../public/js/TimingEngine';
import Analytics from '../../../public/js/Analytics';
import PrefManager from '../../../public/js/PrefManager';
import ScheduleBuilder from '../../../public/js/ScheduleBuilder';
import TimingManager from '../../../public/js/TimingManager';

import Logger from '../../../public/js/Logger';
import Storage from '../../../public/js/Storage';
import View from './ExtnView';
import RequestManager from './ExtnRequestManager';

window.timingEngine = new TimingEngine(),
window.view = new View();
window.Logger = Logger;
window.analytics = new Analytics();
window.prefManager = new PrefManager();
window.scheduleBuilder = new ScheduleBuilder();
window.timingManager = new TimingManager();
window.RequestManager = RequestManager;
window.URL_PREFIX = 'http://localhost:8080';
window.VERSION = '0.4.2';

async function showPrefs() {

	let prefs = prefManager.getAllPreferences();
	let schoolId = timingManager.getSchoolId();

	scheduleBuilder.setFreePeriods(prefs.freePeriods || {});

	if (prefs.school !== schoolId) {
		timingManager.setSchoolId(prefs.school);
		schoolId = prefs.school;
	}

	if ((scheduleBuilder.isNew() || timingManager.isNewSchool()) && timingManager.hasLoopStarted()) {
		await timingManager.initTimer();
	}

	view.updateViewWithState(prefs);
	view.updateScreenDimensions();
}

timingManager.init(prefManager.getSchoolId());
timingManager.setTimerPrepareMethod((school, schedule) => {

	scheduleBuilder.init(school, schedule);
	
	let {presets, calendar, weekly_presets} = scheduleBuilder.buildAll();

	if (timingEngine.isInitialized()) {
		timingEngine.loadNewSchedule(presets, calendar, weekly_presets);
	} else {
		timingEngine.init(presets, calendar, weekly_presets);
	}

});

timingManager.setLoop((firstRun = false) => {

	let time = timingEngine.getRemainingTime();
	time.periodName = prefManager.getPeriodName(time.period) || time.period;

	view.updateScreen(time);

	if (firstRun) {
		analytics.setPeriod(time.period);
		analytics.setPeriodName(time.periodName);
	}

	return timingManager.repeatLoopIn(50);

});

timingManager.initTimer().then(() => {
	view.hidePreloader();
	showPrefs()
});

chrome.runtime.onMessageExternal.addListener((req, sender, sendResponse) => {
	let { deviceId } = req;

	Storage.clearAll();
	if (!deviceId) {
		window.open(URL_PREFIX);
	}

	Storage.setDeviceId(deviceId);
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

document.write(`<iframe src="${URL_PREFIX}/extension-connection.html?v=3" style="display: none;"></iframe>`);

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
