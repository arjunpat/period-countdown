import Logger from './Logger';
import Storage from './Storage';
import RequestManager from './RequestManager';
import TimingManager from './TimingManager';

export const timingManager = new TimingManager();

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

	let tm = timingManager; // alias

	if (window.location.pathname !== '/')
		return tm.state.timeoutId = window.setTimeout(tm.loop, 500); // .5s when user not on the page; helps with cpu usage

	let time = timingEngine.getRemainingTime();
	time.periodName = prefManager.getPeriodName(time.period) || time.period;

	if (firstRun) {
		view.updateScreen(time, true);
		view.updateScheduleTable(timingEngine.getUpcomingEvents(), prefManager.getAllPreferences().periodNames, timingEngine.getCurrentTime());

		analytics.setPeriod(time.period);
		analytics.setPeriodName(time.periodName);

		window.onresize();
		return tm.state.timeoutId = window.setTimeout(tm.loop, 50);
	}

	if (!document.hidden || document.hasFocus()) {
		if (view.updateScreen(time, true)) {
			view.updateScheduleTable(timingEngine.getUpcomingEvents(), prefManager.getAllPreferences().periodNames, timingEngine.getCurrentTime());
		}
		return tm.state.timeoutId = window.setTimeout(tm.loop, 50);
	}

	view.updateScreen(time, false);

	return tm.state.timeoutId = window.setTimeout(tm.loop, 500); // .5s when user not on the page; helps with cpu usage

});

export function router(path, shouldPushHistory = false) {

	if (shouldPushHistory) {
		window.history.pushState({}, '', path);
	}

	switch (path) {
		case '/':
			render.index();
			break;
		case '/settings':
			render.settings();
			break;
		default:
			render.notFound();
	}
}

export const render = {};

render.showPrefs = async () => {
	let prefs = prefManager.getAllPreferences();
	let schoolId = timingManager.getSchoolId();

	scheduleBuilder.setFreePeriods(prefs.freePeriods || {});

	if (prefs.school !== schoolId) {
		timingManager.setSchoolId(prefs.school);
		schoolId = prefs.school;
	}

	// needs to happen hear for the settings page
	await timingManager.loadSchool(schoolId);

	let periods = (timingManager.getSchoolData(schoolId) && timingManager.getSchoolData(schoolId).school.periods) || [];

	view.updateViewWithState(prefs, { periods });

	if ((scheduleBuilder.isNew() || timingManager.isNewSchool()) && timingManager.hasLoopStarted()) {
		await timingManager.initTimer();
	}

}

render.index = () => {

	if (Logger.timingExists('render', 'index'))
		return;

	Logger.time('render', 'index');

	view.switchTo('index');
	document.body.style.overflow = 'hidden';

	if (timingManager.hasLoopStarted()) {
		return Logger.timeEnd('render', 'index');
	}

	timingManager.initTimer().then(() => {
		render.showPrefs();
		view.hidePreloader();

		Logger.timeEnd('render', 'index');

	}).catch(err => {
		view.switchTo('error');

		RequestManager.sendError({
			where: 'browser',
			type: 'client_page_load',
			description: err.stack
		});

		throw err;
	});

	view.index.dayType.onmouseover = () => {
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

	function resizeScreen() {
		view.updateScreenDimensions();
		view.dimensionCanvas();
	}

	window.onresize = resizeScreen;

	view.index.settingsButton.querySelector('div').onclick = () => {
		router('/settings', true);
	}

	// login button
	view.index.googleSignin.querySelector('button').onclick = () => {
		view.addGoogleApi();
		view.showModal('modal-login');
	}

	// logout button
	view.index.googleSignin.querySelector('div').onclick = () => {
		view.addGoogleApi();
		view.showModal('modal-logout');
	}

	document.querySelector('#modal .modal-logout > a').onclick = () => {
		Promise.all([gapi.auth2.getAuthInstance().signOut(), RequestManager.logout()]).then(values => {
			Storage.clearAllExceptDeviceId();
			window.location.reload();
		});
	}

}


render.settings = () => {
	Logger.time('render', 'settings');

	// webpage display
	document.title = 'Settings';
	view.switchTo('settings');
	document.body.style.overflow = '';

	// animation
	view.settings.title.classList.remove('underlineAnimation');
	setTimeout(() => view.settings.title.classList.add('underlineAnimation'), 20);

	if (!prefManager.isLoggedIn()) {
		view.addGoogleApi();
		setTimeout(() => view.showModal('log-in-first'), 2000);
	}

	if (view.settings.closeButton.onclick === null) {
		
		view.settings.closeButton.onclick = () => {

			function newPeriodNames() {

				let periodNames = view.settings.periodNameEnterArea.getPeriodNames();

				for (let period in periodNames) {
					if (periodNames[period] !== prefManager.getPeriodName(period) && !(!periodNames[period] && !prefManager.getPeriodName(period))) {
						return true;
					}
				}

				return false;
			}

			if (
				view.getSelectedThemeNum() === prefManager.getThemeNum()
				&& view.settings.schoolSelector.getSelection() === prefManager.getSchoolId()
				&& !newPeriodNames()
			) {
				router('/', true);
			} else {
				window.scrollTo(0, document.body.scrollHeight);
				view.showModal('unsaved-setting-changes');
				document.querySelector('.unsaved-setting-changes > a').onclick = () => {
					router('/', true);
				}
			}
		}

		view.settings.saveSettingsButton.onclick = () => {
			let elem = view.settings.saveSettingsButton;
			let currentText = elem.innerHTML;
			elem.innerHTML = 'Saving...';
			elem.disabled = 'true';

			let school = view.settings.schoolSelector.getSelection();
			let periodNames = view.settings.periodNameEnterArea.getPeriodNames();
			let theme = view.getSelectedThemeNum();

			prefManager.setPreferences(periodNames, theme, school).then(res => {
				if (res) {
					setTimeout(() => {
						elem.disabled = '';
						elem.innerHTML = currentText;
						render.showPrefs();
					}, 500);
				} else {
					view.showModal('modal-server-down');
				}
			}).catch(err => {
				view.showModal('modal-server-down');
			});

		}

		view.settings.themeSelector.onchange = () => {
			let val = view.getSelectedThemeNum();

			view.showThemeColorExamples(prefManager.getThemeFromNum(val));
		}

		view.settings.schoolSelector.onchange = () => {
			let val = view.settings.schoolSelector.getSelection();

			view.settings.periodNameEnterArea.setPeriods(null);
			timingManager.loadSchool(val).then(() => {
				view.settings.periodNameEnterArea.setPeriods(timingManager.getSchoolData(val).school.periods);
			});

		}

		view.settings.foundBug.onclick = () => view.showModal('modal-found-bug');

	}

	render.showPrefs();
	view.hidePreloader();

	Logger.timeEnd('render', 'settings');
}


render.notFound = () => {
	Logger.time('render', 'not-found');

	document.title = 'Not Found';
	view.switchTo('not-found');
	view.hidePreloader();

	Logger.timeEnd('render', 'not-found');
}

document.onkeydown = (e) => {

	if (window.location.pathname === '/') {

		// support for s to open settings
		if (e.keyCode === 83) {
			e.preventDefault();
			view.index.settingsButton.querySelector('div').click();
		}

	} else if (window.location.pathname === '/settings') {

		// support ctrl/cmd + s as saving
		if (e.keyCode === 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
			e.preventDefault();
			if (view.settings.saveSettingsButton.disabled !== true) {
				view.settings.saveSettingsButton.click();
			}
		}

		// support for esc to close
		if (e.keyCode === 27) {
			e.preventDefault();
			view.settings.closeButton.click();
		}
	}

}
