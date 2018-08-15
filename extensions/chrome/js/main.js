const timingEngine = new TimingEngine(),
	view = new ExtnView(),
	//analytics = new Analytics,
	prefManager = new PrefManager(),
	scheduleBuilder = new ScheduleBuilder(),
	RequestManager = ExtnRequestManager,
	URL_PREFIX = 'http://localhost:8080';

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
});

chrome.runtime.onMessageExternal.addListener((req, sender, sendResponse) => {
	let { device_id } = req;

	if (!device_id) {
		Storage.clearAll();
		window.open(URL_PREFIX);
	}

	Storage.setDeviceId(device_id);
	RequestManager.init().then(values => {
		if (!values) {
			Storage.clearAll();
			window.open(URL_PREFIX);
		}

		if (values.error !== 'not_registered') {
			prefManager.setGoogleAccount(values);
		}
		showPrefs();
	});
});

document.write(`<iframe src="${URL_PREFIX}/extension-connection.html?v=2" style="display: none;"></iframe>`);

view.index.settingsButton.onclick = () => window.open(URL_PREFIX + '/settings');
view.index.googleSignin.querySelector('button').onclick = () => window.open(URL_PREFIX);
