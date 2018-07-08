// instatiate classes
var timingEngine, elements = new Elements(), analytics = new Analytics, prefManager = new PrefManager;


var render = {};
render.index = () => {
	Logger.time('main', 'index');

	elements.switchTo('index');

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

	if (!timingEngine) {
		// startup the actually timer; only happens when u actually go to the index page
		Promise.all([RequestManager.getPresets(), RequestManager.getCalendar()]).then(values => {
			let [presets, calendar] = values;

			timingEngine = new TimingEngine(presets, calendar);
			
			elements.applyPreferencesToElements(prefManager.getAllPreferences()); // before first paint
			mainLoop();
			elements.updateScreenFontSize();
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
			elements.updateScreenFontSize();
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

var load = (path, shouldPushHistory = false) => {

	if (shouldPushHistory) window.history.pushState({}, '', path);

	if (path === '/')
		render.index();
	else if (path === '/settings')
		render.settings();
	else
		render.notFound();
}






// inital page render
load(window.location.pathname);

RequestManager.init().then(data => {

	if (typeof data !== 'object') {
		window.alert('It looks like our servers are having trouble. Try again later.');
		throw "Device id was not established";
	}

	if (data.email) {
		prefManager.setGoogleAccount(data);
		elements.applyPreferencesToElements(prefManager.getAllPreferences());
		analytics.setRegisteredTo(data.email);
	} else
		elements.addGoogleApi();

	if (data.device_id)
		analytics.setNewLoad(true);
	else
		analytics.setNewLoad(false);

	if (Storage.deviceIdExists()) {
		analytics.setDeviceId(Storage.getDeviceId());
		analytics.setTheme(prefManager.getThemeName());
	} else
		throw "Device id was not established";

}).catch(err => {
	RequestManager.sendError({
		where: 'browser',
		type: 'client_page_load',
		description: err.stack
	});
});

// makes sure that back and forwards buttons work
window.onpopstate = () => {
	load(window.location.pathname);
}

// sends analytics
analytics.setPathname(window.location.pathname);

// welcome, cause what else is the computer going to do?
let val = ['Welcome', '欢迎', 'स्वागत हे', 'Bienvenido', 'خوش آمدی', 'Bienvenue', 'желанный', 'Bem vinda', 'Benvenuto', 'Gratus mihi venis', 'Welkom', 'ברוך הבא', 'ようこそ'][Math.floor(Math.random() * 13)];
console.log(`%c${val}`, 'background: #fccb0b; color: #000; font-size: 34px; padding: 6px 20px; font-family: \'sans-serif\'; border-radius: 4px;');






// has to be global for google
var googleApiDidLoad = () => {

	gapi.load('auth2', () => {
		gapi.auth2.init({
			client_id: '989074405041-k1nns8p3h7eb1s7c6e3j6ui5ohcovjso.apps.googleusercontent.com',
			cookiepolicy: 'single_host_origin',
			scope: 'profile email'
		}).then(GoogleAuth => {
			var gSuccess = user => {
				if (elements.modal.open) elements.closeModal();

				let data = user.getBasicProfile();

				let account = {
					email: data.U3,
					first_name: data.ofa,
					last_name: data.wea,
					profile_pic: data.Paa
				}

				prefManager.setGoogleAccount(account);

				RequestManager.login(account).then(res => {
					if (res.data.status === 'returning_user') {
						prefManager.setGoogleAccount(res.data.user_data);
						elements.settingChangesSaved();
					} else if (res.data.status === 'new_user') {
						// OTHER CASE
					} else {
						// OTHER CASE
						window.alert('Our servers are having a bad day. Please try again another time.');
					}
					
					elements.applyPreferencesToElements(prefManager.getAllPreferences());
				}).catch(err => {
					// OTHER CASE
				});
			}

			var gFail = () => {
				window.alert('There was a problem signing you in. Please try again later.');
			}

			for (let element of document.getElementsByClassName('google-login-button'))
				GoogleAuth.attachClickHandler(element, {}, gSuccess, gFail);
		});
	});

}
