import Logger from './Logger';
import Storage from './Storage';
import RequestManager from './RequestManager';

export const render = new class {
	constructor() {
		this.state = {
			newSchool: false,
			loopHasStarted: false,
			schoolData: {}
		}
	}

	async setSchoolId(id) {
		if (this.state.schoolId !== id) {
			this.state.schoolId = id;
			this.state.newSchool = true;
		}
	}

	init(schoolId) {
		this.state.schoolId = schoolId;
	}


	async loadSchool(id) {

		if (!render.state.schoolData[id]) {
			let [ school, schedule ] = await Promise.all([RequestManager.getSchoolMeta(id), RequestManager.getSchoolSchedule(id)]);
			render.state.schoolData[id] = {
				school,
				schedule
			}
		}

	}

}

export function router(path, shouldPushHistory = false) {

	if (shouldPushHistory) {
		window.history.pushState({}, '', path);
	}

	let layers = path.split('/').filter(val => val !== '');


	// path -> /
	if (layers.length === 0) {
		return router(`/${render.state.schoolId}`, true);
	}

	// path -> /:school_id
	if (layers.length === 1) {

		if (layers[0] === 'settings')
			return render.settings();

		if (prefManager.isASchoolId(layers[0])) {
			render.setSchoolId(layers[0]);
			return render.index();
		}
		return render.notFound();
	}

	// 404
	return render.notFound();
}

render.startLoop = () => {
	if (render.state.loopHasStarted)
		return;

	render.loop(true);

	render.state.loopHasStarted = true;
}

render.loop = (firstRun = false) => {

	if (window.location.pathname !== `/${render.state.schoolId}`)
		return render.state.timeoutId = window.setTimeout(render.loop, 500); // .5s when user not on the page; helps with cpu usage

	let time = timingEngine.getRemainingTime();
	time.periodName = prefManager.getPeriodName(time.period) || time.period;

	if (firstRun) {
		view.updateScreen(time, true);
		view.updateScheduleTable(timingEngine.getUpcomingEvents(), prefManager.getAllPreferences().periodNames, timingEngine.getCurrentTime());

		window.onresize();
		return render.state.timeoutId = window.setTimeout(render.loop, 50);
	}

	if (!document.hidden || document.hasFocus()) {
		if (view.updateScreen(time, true)) {
			view.updateScheduleTable(timingEngine.getUpcomingEvents(), prefManager.getAllPreferences().periodNames, timingEngine.getCurrentTime());
		}
		return render.state.timeoutId = window.setTimeout(render.loop, 50);
	}

	view.updateScreen(time, false);

	return render.state.timeoutId = window.setTimeout(render.loop, 500); // .5s when user not on the page; helps with cpu usage
}

render.stopLoop = () => {
	if (typeof render.state.timeoutId !== 'undefined') {
		window.clearTimeout(render.state.timeoutId);
		render.state.loopHasStarted = false;
	}
}

render.showPrefs = async () => {
	let prefs = prefManager.getAllPreferences();
	let { schoolId } = render.state;

	if (prefs.school !== schoolId) {
		render.setSchoolId(prefs.school);
		schoolId = prefs.school;
	}

	await render.loadSchool(schoolId);

	let periods = (render.state.schoolData[schoolId] && render.state.schoolData[schoolId].school.periods) || [];

	view.updateViewWithState(prefs, { periods });

	scheduleBuilder.setFreePeriods(prefs.freePeriods || {});

	if (scheduleBuilder.isNew() || render.state.newSchool) {
		render.initTimer();
	}
}


render.initTimer = async () => {

	let { schoolId } = render.state;

	await render.loadSchool(schoolId);

	Logger.time('render', 'full timer init');

	scheduleBuilder.init(render.state.schoolData[schoolId].school, render.state.schoolData[schoolId].schedule);
	let {presets, calendar, weekly_presets} = scheduleBuilder.buildAll();

	if (timingEngine.isInitialized()) {
		timingEngine.loadNewSchedule(presets, calendar, weekly_presets);
	} else {
		timingEngine.init(presets, calendar, weekly_presets);
	}

	render.stopLoop();
	render.state.newSchool = false;
	render.startLoop();

	Logger.timeEnd('render', 'full timer init');

}


render.index = () => {
	Logger.time('render', 'index');

	view.switchTo('index');
	document.body.style.overflow = 'hidden';

	if (render.state.loopHasStarted) {
		return Logger.timeEnd('render', 'index');
	}

	render.initTimer().then(() => {
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
			if (view.settings.saved) {
				router('/', false);
			} else {
				window.scrollTo(0, document.body.scrollHeight);
				view.showModal('unsaved-setting-changes');
				document.querySelector('.unsaved-setting-changes > a').onclick = () => {
					router('/', false);
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
						view.settingChangesSaved();
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

			if (val !== prefManager.getThemeNum())
				view.settingChangesNotSaved();

			view.showThemeColorExamples(prefManager.getThemeFromNum(val));
		}

		view.settings.schoolSelector.onchange = () => {
			let val = view.settings.schoolSelector.getSelection();

			if (val !== prefManager.getSchoolId())
				view.settingChangesNotSaved();

			view.settings.periodNameEnterArea.setPeriods(null);
			render.loadSchool(val).then(() => {
				view.settings.periodNameEnterArea.setPeriods(render.state.schoolData[val].school.periods);
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

	if (window.location.pathname === `/${render.state.schoolId}`) {

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
				view.settings.saveSettingsButton.click();
		}

		// support for esc to close
		if (e.keyCode === 27) {
			e.preventDefault();
			view.settings.closeButton.click();
		}
	}

}
