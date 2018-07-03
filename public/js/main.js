// instatiate classes
var bellTimer, elements = new Elements(), analytics = new Analytics, prefManager = new PrefManager;


var render = {
	index: () => {
		Logger.time('main', 'index');

		elements.switchTo('index');

		let firstRun = true;
		var mainLoop = () => {

			if (window.location.pathname === '/') {

				let time = bellTimer.getRemainingTime();

				time.period_name = prefManager.getPeriodName(time.period) || time.period;

				elements.updateScreen(time);

				if (firstRun) {
					analytics.setPeriod(time.period);
					analytics.setPeriodName(time.period_name)
					firstRun = false;
				}

			}

			setTimeout(mainLoop, 50);
		}

		if (!bellTimer) {
			// startup the actually timer; only happens when u actually go to the index page
			Promise.all([RequestManager.getPresets(), RequestManager.getCalendar()]).then(values => {
				let [presets, calendar] = values;

				bellTimer = new BellTimer(presets, calendar);
				
				elements.updateElementsWithPreferences(prefManager.getAllPreferences()); // before first paint
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
		} else
			Logger.timeEnd('main', 'index');
	},
	settings: () => {

		Logger.time('main', 'settings');

		// webpage display
		document.title = 'Settings - Bell Countdown';
		elements.switchTo('settings');

		// animation
		elements.settings.title.classList.remove('underlineAnimation');
		setTimeout(() => elements.settings.title.classList.add('underlineAnimation'), 20);

		// form stuff
		if (elements.settings.inputs[0].onkeyup === null)
			for (let element of elements.settings.inputs) {
				let period_num = element.id.substring(6, 7);

				element.onkeyup = element.onblur = () => {
					if (element.value !== prefManager.getPeriodName(period_num)) {
						if (element.value.length > 0)
							element.classList.add('has-value');
						else
							element.classList.remove('has-value');
						elements.settingChangesNotSaved();
					}
				}
			}

	
		if (elements.settings.saveSettingsButton.onclick === null)
			elements.settings.saveSettingsButton.onclick = () => {
				let elem = elements.settings.saveSettingsButton;
				let currentText = elem.innerHTML;
				elem.innerHTML = 'Saving...';
				elem.disabled = 'true';

				let names = {};

				for (let element of elements.settings.inputs) {
					let num = parseInt(element.id.substring(6, 7));
					element.value = element.value.trim();
					names[num] = element.value;
				}

				prefManager.setPeriodNames(names);

				setTimeout(() => {
					elem.disabled = '';
					elem.innerHTML = currentText;
					elements.settingChangesSaved();
				}, 2000);

			}

		if (elements.settings.closeButton.onclick === null)
			elements.settings.closeButton.onclick = () => {
				if (!elements.settings.saved)
					elements.settings.saveSettingsButton.click();
				load('/', true);
			}

		elements.fillPeriodNameInputs(prefManager.getAllPreferences().period_names);


		Logger.timeEnd('main', 'settings');
	},
	notFound: () => {
		Logger.time('main', 'notFound');

		document.title = 'Not Found - Bell Countdown';
		elements.switchTo('not-found');

		Logger.timeEnd('main', 'notFound');
	}
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
load(window.location.pathname, false);

RequestManager.init().then(data => {

	if (data.email) {
		prefManager.setGoogleAccount(data);
		elements.updateElementsWithPreferences(prefManager.getAllPreferences());
		analytics.setRegisteredTo(data.email);
	} else
		elements.addGoogleApi();

	if (window.localStorage.device_id) {
		analytics.setDeviceId(window.localStorage.device_id);
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
	load(window.location.pathname, false);
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
			GoogleAuth.attachClickHandler(elements.index.googleSignin.querySelector('button'), {}, user => {
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
					} else if (res.data.status === 'new_user') {

					} else {
						window.alert('Our servers are having a bad day. Please try again another time.');
					}
					
					elements.updateElementsWithPreferences(prefManager.getAllPreferences());
				})

			}, () => {});
		});
	});

}