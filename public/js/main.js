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
				element.onkeyup = () => {
					if (prefManager.setPeriodName(period_num, element.value))
						Logger.log('main', 'period names saved');
					else
						Logger.log('main', 'period names not saved')
				}
				element.onblur = () => {
					if (element.value.length > 0)
						element.classList.add('has-value');
					else
						element.classList.remove('has-value');
					element.onkeyup();
				}
				let name = prefManager.getPeriodName(period_num);
				if (name) element.value = name, element.onblur();
			}

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
	}

	if (window.localStorage.device_id) {
		analytics.setDeviceId(window.localStorage.device_id);
		analytics.setTheme(prefManager.getThemeName());
	} else
		throw "Device id was not established";

	console.log(data);

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
			return GoogleAuth.signIn({
				scope: 'profile email'
			});
		}).then(data => {
			let account = {
				email: data.w3.U3,
				first_name: data.w3.ofa,
				last_name: data.w3.wea,
				profile_pic: data.w3.Paa
			}
			prefManager.setGoogleAccount(account);
			return RequestManager.login(account);
		}).then(data => {
			if (data.status) {
				elements.updateElementsWithPreferences(prefManager.getAllPreferences());
			} else {
				window.alert('Our servers are having a bad day. Please try again another time.');
			}
		}).catch(e => {
			if (e.error === 'popup_blocked_by_browser') {
				window.alert('It looks like your browser blocked Google from displaying their sign in screen. Please allow pop-ups and try again.')
			}
		});
	});

}