import Logger from './Logger';
import TimingManager from './TimingManager';
import TimingEngine from './TimingEngine';
import View from './View';
import Analytics from './Analytics';
import PrefManager from './PrefManager';
import RequestManager from './RequestManager';
import ScheduleBuilder from './ScheduleBuilder';
import { generateGoogleSignInLink, isProd } from '../../../common.js';
import { isExtn, openLink } from './extras';

export const logger = new Logger();
export const timingManager = new TimingManager();
export const timingEngine = new TimingEngine();
export const view = new View();
export const analytics = new Analytics();
export const prefManager = new PrefManager();
export const scheduleBuilder = new ScheduleBuilder();

timingManager.setTimerPrepareMethod((school, schedule) => {
	scheduleBuilder.setFreePeriods(prefManager.getAllPreferences().freePeriods || {});
	scheduleBuilder.init(school, schedule);
	
	let { presets, calendar, defaults } = scheduleBuilder.buildAll();

	timingEngine.init(presets, calendar, defaults);
});

timingManager.setLoop((firstRun = false) => {
	let time = timingEngine.getRemainingTime();
	time.periodName = prefManager.getPeriodName(time.period) || time.period;

	if (firstRun) {
		view.updateScreen(time, true);

		
		if (time.period !== time.periodName) {
			analytics.set('user_period', time.periodName);
		}
		analytics.set('period', time.period);

		window.onresize();
		return timingManager.repeatLoopIn(250);
	}

	// quick and dirty hack
	let p = prefManager.getAllPreferences();
	if (!isExtn)
		view.updateScheduleTable(timingEngine.getUpcomingEvents(), p.periodNames, timingEngine.getCurrentTime(), p.rooms);
	else view.setCurrentPeriodLink(p.rooms[time.period] && p.rooms[time.period].url);

	view.updateScreen(time, !document.hidden || document.hasFocus());
	return timingManager.repeatLoopIn(1000);
});

export function render() {
	logger.time('render', 'index');

	timingManager.initTimer().then(() => {
		showPrefs();
		view.hidePreloader();
		
		if (!isExtn)
			view.index.scheduleTable.style.display = 'block';

		logger.timeEnd('render', 'index');
	}).catch(err => {
		RequestManager.sendError(err);

		throw err;
	});

	/* if (!isExtn) {
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
	} */

	function resizeScreen() {
		view.updateScreenDimensions();
		view.dimensionCanvas();
	}

	window.onresize = resizeScreen;

	// login button
	view.index.googleSignin.querySelector('button').onclick = () => {
		openLink(generateGoogleSignInLink());
	}

	/* temp stuff for DL */
	function openHomePage() {
		if (isProd)
				openLink('https://periods.io');
			else
				openLink('http://localhost:8080');
	}

	if (isExtn) {
		view.index.mainCanvas.onclick = openHomePage;
		view.index.dayType.onclick = openHomePage;
	}
	/* end temp stuff for DL */

	// settings button
	view.index.settingsButton.querySelector('div').onclick = () => {
		if (prefManager.isLoggedIn()) {
			if (isProd)
				openLink('https://account.periods.io/settings');
			else
				openLink('http://localhost:8082');
		} else {
			openLink(generateGoogleSignInLink());
		}
	}

	// profile picture
	view.index.googleSignin.querySelector('div').onclick = () => {
		openLink('https://account.periods.io/settings');
	}
}

export async function showPrefs() {
	let prefs = prefManager.getAllPreferences();

	scheduleBuilder.setFreePeriods(prefs.freePeriods || {});
	timingManager.setSchoolId(prefs.school);

	view.updateViewWithState(prefs);

	if ((scheduleBuilder.isNew() || timingManager.isNewSchool()) && timingManager.hasLoopStarted()) {
		await timingManager.initTimer();
	}
}
