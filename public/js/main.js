const APP_VERSION = '0.4.2', // needs to match sw.js
	timingEngine = new TimingEngine(),
	view = new View(),
	analytics = new Analytics,
	prefManager = new PrefManager,
	scheduleBuilder = new ScheduleBuilder();

// inital page render
load(window.location.pathname);

RequestManager.init().then(data => {

	if (typeof data !== 'object') {
		window.alert('It looks like our servers are having trouble. Try again later.');
		throw "Device id was not established";
	}

	if (data.email) {
		prefManager.setGoogleAccount(data);
		render.showPrefs();
		analytics.setRegisteredTo(data.email);
	} else
		view.addGoogleApi();

	if (data.device_id)
		analytics.setNewLoad(true);
	else
		analytics.setNewLoad(false);

	if (Storage.deviceIdExists()) {
		analytics.setDeviceId(Storage.getDeviceId());
		analytics.setTheme(prefManager.getThemeNum());
	} else
		throw "Device id was not established";

}).catch(err => {

	//view.showOffline();

	RequestManager.sendError({
		where: 'browser',
		type: 'client_page_load',
		description: err.stack
	});
});

// makes sure that back and forwards buttons work
window.onpopstate = () => load(window.location.pathname);

// sends analytics
analytics.setPathname(window.location.pathname);

// add service workers
if (navigator.serviceWorker) {
	navigator.serviceWorker.register('/sw.js').then((reg) => {
		Logger.log('main', 'service worker registered');
	}).catch(err => {
		Logger.log('main', 'service worker registration failed');
		console.error(err);
	})
}


// welcome, cause what else is the computer going to do?
let val = ['Welcome', '欢迎', 'स्वागत हे', 'Bienvenido', 'خوش آمدی', 'Bienvenue', 'желанный', 'Bem vinda', 'Benvenuto', 'Gratus mihi venis', 'Welkom', 'ברוך הבא', 'ようこそ'][Math.floor(Math.random() * 13)];
console.log(`%c${val}`, 'background: #fccb0b; color: #000; font-size: 34px; padding: 6px 20px; font-family: \'sans-serif\'; border-radius: 4px;');

// has to be global for google
var googleApiDidLoad = () => {

	gapi.load('auth2', () => {
		gapi.auth2.init({
			client_id: '770077939711-hbanoschq9p65gr8st8grsfbku4bsnhl.apps.googleusercontent.com',
			cookiepolicy: 'single_host_origin',
			scope: 'profile email'
		}).then(GoogleAuth => {
			let gSuccess = user => {
				if (view.modal.open) view.closeModal();

				let data = user.getBasicProfile();

				let account = {
					email: data.U3,
					first_name: data.ofa,
					last_name: data.wea,
					profile_pic: data.Paa
				}

				//prefManager.setGoogleAccount(account);

				RequestManager.login(account).then(res => {
					if (res.data.status === 'returning_user') {
						prefManager.setGoogleAccount(res.data.user_data);
						view.settingChangesSaved();
					} else if (res.data.status === 'new_user') {
						prefManager.setGoogleAccount(res.data.user_data);
						// OTHER CASE
					} else {
						// OTHER CASE
						window.alert('Our servers are having a bad day. Please try again another time.');
					}
					
					render.showPrefs();
				}).catch(err => {
					// OTHER CASE
				});
			}

			let gFail = () => window.alert('There was a problem signing you in. Please try again later.');

			for (let element of document.getElementsByClassName('google-login-button'))
				GoogleAuth.attachClickHandler(element, {}, gSuccess, gFail);
		});
	});

};
