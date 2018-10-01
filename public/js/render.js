import Logger from './Logger.js';
import Storage from './Storage.js';
import RequestManager from './RequestManager.js';

export const render = new class {
	constructor() {
		this.newSchool = false;
		this.loopHasStarted = false;
	}

	setSchoolId(id) {
		if (this.schoolId !== id) {
			this.schoolId = id;
			this.newSchool = true;
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
		if (render.schoolId) {
			return router(`/${render.schoolId}`, true);
		}
		return router('/mvhs', true);
	}

	// path -> /:school_id
	if (layers.length === 1) {

		if (layers[0] === 'settings')
			return render.settings();

		return prefManager.isASchool(layers[0]).then(val => {
			if (val) {
				render.setSchoolId(layers[0]);
				return render.index();
			}
			
			return render.notFound();
		});
	}

	// 404
	return render.notFound();
}

render.startLoop = () => {
	if (render.loopHasStarted)
		return;

	render.loop(true);

	render.loopHasStarted = true;
}

render.loop = (firstRun = false) => {

	if (window.location.pathname !== `/${render.schoolId}`)
		return render.timeoutId = window.setTimeout(render.loop, 500); // .5s when user not on the page; helps with cpu usage

	let time = timingEngine.getRemainingTime();
	time.periodName = prefManager.getPeriodName(time.period) || time.period;

	if (firstRun) {
		view.updateScreen(time, true);
		view.updateScheduleTable(timingEngine.getUpcomingEvents(), prefManager.getAllPreferences().period_names, timingEngine.getCurrentTime());

		window.onresize();
		return render.timeoutId = window.setTimeout(render.loop, 50);
	}

	if (!document.hidden || document.hasFocus()) {
		if (view.updateScreen(time, true)) {
			view.updateScheduleTable(timingEngine.getUpcomingEvents(), prefManager.getAllPreferences().period_names, timingEngine.getCurrentTime());
		}
		return render.timeoutId = window.setTimeout(render.loop, 50);
	}

	view.updateScreen(time, false);

	return render.timeoutId = window.setTimeout(render.loop, 500); // .5s when user not on the page; helps with cpu usage
}

render.stopLoop = () => {
	if (typeof render.timeoutId !== "undefined") {
		window.clearTimeout(render.timeoutId);
		render.loopHasStarted = false;
	}
}

render.showPrefs = () => {
	let prefs = prefManager.getAllPreferences();
	view.applyPreferencesToElements(prefs);
	scheduleBuilder.setFreePeriods(prefs.free_periods);

	if (scheduleBuilder.isNew() || render.newSchool) {
		render.initTimer();
	}
}


render.initTimer = async () => {

	let { schoolId } = render;
	let [ school, schedule ] = await Promise.all([RequestManager.getSchoolMeta(schoolId), RequestManager.getSchoolSchedule(schoolId)]);

	Logger.time('render', 'full timer init');

	scheduleBuilder.init(school, schedule);
	let {presets, calendar, weekly_presets} = scheduleBuilder.buildAll();

	if (timingEngine.isInitialized()) {
		timingEngine.loadNewSchedule(presets, calendar, weekly_presets);
	} else {
		timingEngine.init(presets, calendar, weekly_presets);
	}

	render.stopLoop();
	render.newSchool = false;
	render.startLoop();

	Logger.timeEnd('render', 'full timer init');

}


render.index = () => {
	Logger.time('render', 'index');

	view.switchTo('index');

	if (render.loopHasStarted)
		return;

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

render.notFound = () => {
	Logger.time('render', 'not-found');

	document.title = 'Not Found';
	view.switchTo('not-found');
	view.hidePreloader();

	Logger.timeEnd('render', 'not-found');
}
