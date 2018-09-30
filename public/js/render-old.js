import Logger from './Logger.js';
import Storage from './Storage.js';
import RequestManager from './RequestManager.js';

export const render = {};

export function load(path, shouldPushHistory = false) {

	if (shouldPushHistory)
		window.history.pushState({}, '', path);

	switch (path) {
		case '/':
			render.index();
			break;
		case '/settings':
			render.settings();
			break;
		default:
			render.notFound();
			break;
	}
}

render.index = () => {
	Logger.time('render', 'index');

	view.switchTo('index');

	if (timingEngine.isInitialized())
		return Logger.timeEnd('render', 'index');

	let firstRun = true;
	function mainLoop() {
		
		if (window.location.pathname === '/') {

			let time = timingEngine.getRemainingTime();
			time.period_name = prefManager.getPeriodName(time.period) || time.period;

			if (firstRun) {
				view.updateScreen(time, true);
				view.updateScheduleTable(timingEngine.getUpcomingPeriods(), prefManager.getAllPreferences().period_names, timingEngine.getCurrentTime());

				analytics.setPeriod(time.period);
				analytics.setPeriodName(time.period_name);

				window.onresize();
				firstRun = false;
				return window.setTimeout(mainLoop, 50);
			}

			if (!document.hidden || document.hasFocus()) {
				if (view.updateScreen(time, true)) {
					view.updateScheduleTable(timingEngine.getUpcomingPeriods(), prefManager.getAllPreferences().period_names, timingEngine.getCurrentTime());
				}
				return window.setTimeout(mainLoop, 50);
			}

			view.updateScreen(time, false);
		}
		return window.setTimeout(mainLoop, 500); // .5s when user not on the page; helps with cpu usage
	}

	// startup the actually timer; only happens when u actually go to the index page
	Promise.all([RequestManager.getPresets(), RequestManager.getCalendar()]).then(values => {
		let [presets, calendar] = values;

		Logger.time('render', 'full timer init');

		scheduleBuilder.init(presets, calendar);
		timingEngine.init(scheduleBuilder.generatePresets(), scheduleBuilder.getCalendar());
		Logger.timeEnd('render', 'full timer init');

		render.showPrefs();
		mainLoop();
		view.hidePreloader();

		Logger.timeEnd('render', 'index');

	}).catch(err => {
		view.switchTo('error');

		RequestManager.sendError({
			where: 'browser',
			type: 'client_page_load',
			description: err.stack
		});

		throw new Error();
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
		load('/settings', true);
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

	// animation
	view.settings.title.classList.remove('underlineAnimation');
	setTimeout(() => view.settings.title.classList.add('underlineAnimation'), 20);

	if (!prefManager.isLoggedIn()) {
		view.addGoogleApi();
		setTimeout(() => view.showModal('log-in-first'), 2000);
	}

	// form stuff
	if (view.settings.closeButton.onclick === null) {

		view.settings.closeButton.onclick = () => {
			if (view.settings.saved)
				load('/', true);
			else {
				window.scrollTo(0, document.body.scrollHeight);
				view.showModal('unsaved-setting-changes');
				document.querySelector('.unsaved-setting-changes > a').onclick = () => {
					load('/', true);
				}
			}
		}

		view.settings.saveSettingsButton.onclick = () => {
			let elem = view.settings.saveSettingsButton;
			let currentText = elem.innerHTML;
			elem.innerHTML = 'Saving...';
			elem.disabled = 'true';

			let theme = view.getSelectedThemeNum();
			let names = view.getValuesFromAllPeriodInputs();

			prefManager.setPreferences(names, theme).then(val => {
				if (val)
					setTimeout(() => {
						elem.disabled = '';
						elem.innerHTML = currentText;
						view.settingChangesSaved();
						render.showPrefs();
					}, 500);
				else
					view.showModal('modal-server-down');
			}).catch(err => {
				view.showModal('modal-server-down');
			});

		}

		view.settings.themeSelector.onchange = () => {
			let val = view.getSelectedThemeNum();

			if (val !== prefManager.getThemeNum())
				view.settingChangesNotSaved();

			view.showThemeColorExamples(prefManager.getThemeFromNum(val));
		}

		view.settings.foundBug.onclick = () => view.showModal('modal-found-bug')

		for (let element of view.settings.inputs) {
			let period_num = view.getIdFromInputElem(element);

			element.onblur = () => {
				element.onkeyup();
			}

			element.onkeyup = () => {
				let val = element.value.trim();

				if (val !== prefManager.getPeriodName(period_num) && !(val === '' && prefManager.getPeriodName(period_num) === undefined)) {
					if (val.length > 0)
						element.classList.add('has-value');
					else
						element.classList.remove('has-value');

					view.settingChangesNotSaved();
				}

				let names = view.getValuesFromAllPeriodInputs();

				for (let elem of view.settings.inputs) {
					let res = prefManager.isFreePeriodGivenContext(names, view.getIdFromInputElem(elem));
					view.showPeriodInput(elem, res, null);
				}

			}

		}
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


render.showPrefs = () => {
	let prefs = prefManager.getAllPreferences();
	view.applyPreferencesToElements(prefs);
	scheduleBuilder.setFreePeriods(prefs.free_periods);

	if (scheduleBuilder.isNew()) {
		timingEngine.loadNewPresets(scheduleBuilder.generatePresets());
		view.updateScheduleTable(timingEngine.getUpcomingPeriods(), timingEngine.getCurrentTime());
	}
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
			if (view.settings.saveSettingsButton.disabled !== true)
				view.settings.saveSettingsButton.onclick();
		}

		// support for esc to close
		if (e.keyCode === 27) {
			e.preventDefault();
			view.settings.closeButton.click();
		}
	}

}
