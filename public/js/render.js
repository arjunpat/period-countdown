'use strict';

const load = (path, shouldPushHistory = false) => {

	if (shouldPushHistory) window.history.pushState({}, '', path);

	if (path === '/')
		render.index();
	else if (path === '/settings')
		render.settings();
	else
		render.notFound();
}

const render = {};

render.index = () => {
	Logger.time('render', 'index');

	view.switchTo('index');

	if (timingEngine)
		return Logger.timeEnd('render', 'index');

	let firstRun = true;
	var mainLoop = () => {

		if (window.location.pathname === '/') {

			let time = timingEngine.getRemainingTime();

			time.period_name = prefManager.getPeriodName(time.period) || time.period;

			if (firstRun) {
				view.updateScreen(time, true);
				analytics.setPeriod(time.period);
				analytics.setPeriodName(time.period_name);
				window.onresize();
				firstRun = false;
				return window.setTimeout(mainLoop, 50);
			}

			if (document.hasFocus()) {
				view.updateScreen(time, true);
				return window.setTimeout(mainLoop, 50);
			}

			view.updateScreen(time, false);

		}

		return window.setTimeout(mainLoop, 500); // .5s when user not on the page; helps with cpu usage
	}

	// startup the actually timer; only happens when u actually go to the index page
	Promise.all([RequestManager.getPresets(), RequestManager.getCalendar()]).then(values => {
		let [presets, calendar] = values;

		timingEngine = new TimingEngine(presets, calendar);
		
		view.applyPreferencesToElements(prefManager.getAllPreferences()); // before first paint
		mainLoop();
		//view.hidePreloader();
	
		Logger.timeEnd('render', 'index');

	}).catch(err => {
		//view.showErrorScreen();
		RequestManager.sendError({
			where: 'browser',
			type: 'client_page_load',
			description: err.stack
		});
	});

	window.onresize = () => {
		view.updateScreenDimensions();
		view.dimensionCanvas();
	}

	view.index.settingsButton.querySelector('div').onclick = () => {
		load('/settings', true);

		if (!prefManager.isLoggedIn())
			setTimeout(() => view.showModal('log-in-first'), 2000);
	}

	view.index.googleSignin.querySelector('div').onclick = () => {
		view.addGoogleApi();
		view.showModal('modal-profile-options');
	}

	document.querySelector('#modal .modal-profile-options > button').onclick = () => {
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

	// form stuff
	if (view.settings.closeButton.onclick === null) {

		view.settings.closeButton.onclick = () => {
			if (view.settings.saved)
				load('/', true);
			else {
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

			let theme = parseInt(view.settings.themeSelector.value);

			let names = {};
			for (let element of view.settings.inputs) {
				let num = parseInt(element.id.substring(6, 7));
				names[num] = element.value.trim();
			}

			prefManager.setPreferences(names, theme).then(val => {
				if (val)
					setTimeout(() => {
						elem.disabled = '';
						elem.innerHTML = currentText;
						view.settingChangesSaved();
						view.applyPreferencesToElements(prefManager.getAllPreferences());
					}, 2e3);
				else
					window.alert("Your preferences can not be saved at this time due to a server error. Try again later.");
			});

		}

		view.settings.themeSelector.onchange = () => {
			let val = parseInt(view.settings.themeSelector.value);

			if (val !== prefManager.getThemeNum())
				view.settingChangesNotSaved();

			view.showThemeColorExamples(prefManager.getThemeFromNum(val));
		}

		for (let element of view.settings.inputs) {
			let period_num = parseInt(element.id.substring(6, 7));

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

					// logic to check for free period
					if (PrefManager.isFreePeriod(val)) {
						element.style.textDecoration = 'line-through';
						element.nextElementSibling.innerHTML += ' - removed from schedule';
					} else {
						element.style.textDecoration = 'none';
						element.nextElementSibling.innerHTML = element.nextElementSibling.innerHTML.replace(' - removed from schedule', '');
					}

				}
			}


		}

	}

	view.applyPreferencesToElements(prefManager.getAllPreferences());

	Logger.timeEnd('render', 'settings');
}


render.notFound = () => {
	Logger.time('render', 'not-found');

	document.title = 'Not Found - Bell Countdown';
	view.switchTo('not-found');

	Logger.timeEnd('render', 'not-found');
}
