import Logger from './Logger';
export const logger = new Logger();
import Storage from './Storage';
import TimingManager from './TimingManager';
import TimingEngine from './TimingEngine';
import View from './View';
import Analytics from './Analytics';
import PrefManager from './PrefManager';
import RequestManager from './RequestManager';
import ScheduleBuilder from './ScheduleBuilder';
import { generateGoogleSignInLink } from '../../../common.js';
import { isExtn } from './extras';

export const timingManager = new TimingManager();
export const timingEngine = new TimingEngine();
export const view = new View();
export const analytics = new Analytics();
export const prefManager = new PrefManager();
export const scheduleBuilder = new ScheduleBuilder();

timingManager.setTimerPrepareMethod((school, schedule) => {
	scheduleBuilder.init(school, schedule);
	
	let { presets, calendar, defaults } = scheduleBuilder.buildAll();

	timingEngine.init(presets, calendar, defaults);
});

timingManager.setLoop((firstRun = false) => {
	let time = timingEngine.getRemainingTime();
	time.periodName = prefManager.getPeriodName(time.period) || time.period;

	if (firstRun) {
		view.updateScreen(time, true);

		analytics.setPeriod(time.period);		
		analytics.setPeriodName(time.periodName);

		window.onresize();
		return timingManager.repeatLoopIn(250);
	}

	if (!document.hidden || document.hasFocus()) {
		view.updateScreen(time, true)
		return timingManager.repeatLoopIn(250);
	}

	view.updateScreen(time, false);

	return timingManager.repeatLoopIn(1000); // .5s when user not on the page; helps with cpu usage
});

export function render() {
	logger.time('render', 'index');

	timingManager.initTimer().then(() => {
		showPrefs();
		view.hidePreloader();

		logger.timeEnd('render', 'index');
	}).catch(err => {
		RequestManager.sendError(err);

		throw err;
	});

	if (!isExtn) {
		view.index.dayType.onmouseover = () => {
			view.updateScheduleTable(timingEngine.getUpcomingEvents(), prefManager.getAllPreferences().periodNames, timingEngine.getCurrentTime());
			view.index.scheduleTable.style.display = 'block';
			setTimeout(() => {
				view.index.scheduleTable.style.opacity = '1';
			}, 20);
		}

		view.index.dayType.onmouseleave = () => {
			view.index.scheduleTable.style.opacity = '0';
			setTimeout(() => {
				view.index.scheduleTable.style.display = 'none';
			}, 500);
		}	
	}

	function resizeScreen() {
		view.updateScreenDimensions();
		view.dimensionCanvas();
	}

	window.onresize = resizeScreen;

	// login button
	view.index.googleSignin.querySelector('button').onclick = () => {
		window.location.href = generateGoogleSignInLink();
	}

	// settings button

	view.index.settingsButton.querySelector('div').onclick = () => {
		if (prefManager.isLoggedIn()) {
			isExt ? window.open('https://account.periods.io/settings', '_blank') : (window.location.href = 'https://account.periods.io/settings');
		} else {
			window.location.href = generateGoogleSignInLink();
		}
	}


	// profile picture
	view.index.googleSignin.querySelector('div').onclick = () => {
		window.location.href = 'https://account.periods.io/settings';
	}
}

export async function showPrefs() {
	let prefs = prefManager.getAllPreferences();
	let schoolId = timingManager.getSchoolId();

	scheduleBuilder.setFreePeriods(prefs.freePeriods || {});

	if (prefs.school !== schoolId) {
		timingManager.setSchoolId(prefs.school);
		schoolId = prefs.school;
	}

	view.updateViewWithState(prefs);

	if ((scheduleBuilder.isNew() || timingManager.isNewSchool()) && timingManager.hasLoopStarted()) {
		await timingManager.initTimer();
	}
}
