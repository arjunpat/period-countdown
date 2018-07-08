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
	Logger.time('main', 'index');

	elements.switchTo('index');

	if (!timingEngine) {

		let firstRun = true;
		var mainLoop = () => {

			if (window.location.pathname === '/') {

				let time = timingEngine.getRemainingTime();

				time.period_name = prefManager.getPeriodName(time.period) || time.period;

				elements.updateScreen(time);

				if (firstRun) {
					window.onresize();
					analytics.setPeriod(time.period);
					analytics.setPeriodName(time.period_name);
					firstRun = false;
				}

			}

			setTimeout(mainLoop, 50);
		}
		// startup the actually timer; only happens when u actually go to the index page
		Promise.all([RequestManager.getPresets(), RequestManager.getCalendar()]).then(values => {
			let [presets, calendar] = values;

			timingEngine = new TimingEngine(presets, calendar);
			
			elements.applyPreferencesToElements(prefManager.getAllPreferences()); // before first paint
			mainLoop();
			//elements.hidePreloader();
		
			Logger.timeEnd('main', 'index');

		}).catch(err => {
			//elements.showErrorScreen();
			RequestManager.sendError({
				where: 'browser',
				type: 'client_page_load',
				description: err.stack
			});
		});

		window.onresize = () => {
			elements.updateScreenDimensions();
			elements.dimensionCanvas();
		}

		elements.index.settingsButton.querySelector('div').onclick = () => {
			load('/settings', true);

			if (!prefManager.isLoggedIn())
				setTimeout(() => elements.showModal('log-in-first'), 2000);
		}

		elements.index.googleSignin.querySelector('div').onclick = () => {
			elements.addGoogleApi();
			elements.showModal('modal-profile-options');
		}

		document.querySelector('#modal .modal-profile-options > button').onclick = () => {
			Promise.all([gapi.auth2.getAuthInstance().signOut(), RequestManager.logout()]).then(values => {
				Storage.clearAllExceptDeviceId();
				window.location.reload();
			});
		}
	} else
		Logger.timeEnd('main', 'index');

}
render.settings = () => {

	Logger.time('main', 'settings');

	// webpage display
	document.title = 'Settings - Bell Countdown';
	elements.switchTo('settings');

	// animation
	elements.settings.title.classList.remove('underlineAnimation');
	setTimeout(() => elements.settings.title.classList.add('underlineAnimation'), 20);

	// form stuff
	if (elements.settings.closeButton.onclick === null) {

		var savePeriodNames = () => {
			let names = {};
			for (let element of elements.settings.inputs) {
				let num = element.id.substring(6, 7);
				names[num] = element.value.trim();
			}

			prefManager.setPeriodNames(names).then(val => {
				if (val)
					setTimeout(() => {
						elements.settingChangesSaved();
					}, 1000);
				else
					window.alert('not saving'); // TODO
			});
		}

		elements.settings.closeButton.onclick = () => {
			if (!elements.settings.saved)
				savePeriodNames();
			load('/', true);
		}

		for (let element of elements.settings.inputs) {
			let period_num = parseInt(element.id.substring(6, 7));

			element.onblur = () => {
				element.onkeyup();

				if (element.value !== prefManager.getPeriodName(period_num) && !(element.value === '' && prefManager.getPeriodName(period_num) === undefined))
					savePeriodNames();

			}
			element.onkeyup = () => {
				if (element.value !== prefManager.getPeriodName(period_num)) {
					if (element.value.length > 0)
						element.classList.add('has-value');
					else
						element.classList.remove('has-value');
					elements.settingChangesNotSaved();
				}
			}
		}
		elements.settings.themeSelector.onchange = () => {
			let val = elements.settings.themeSelector.value;

			prefManager.setThemeByName(val).then(success => {
				if (success)
					elements.applyPreferencesToElements(prefManager.getAllPreferences());
				else
					window.alert('We are having trouble saving your theme change. Try again later.'); // TODO give some error!
			});
		}
	}

	elements.applyPreferencesToElements(prefManager.getAllPreferences());


	Logger.timeEnd('main', 'settings');
}
render.notFound = () => {
	Logger.time('main', 'not-found');

	document.title = 'Not Found - Bell Countdown';
	elements.switchTo('not-found');

	Logger.timeEnd('main', 'not-found');
}
