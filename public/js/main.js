const timingEngine = new TimingEngine(),
	view = new View(),
	analytics = new Analytics,
	prefManager = new PrefManager,
	scheduleBuilder = new ScheduleBuilder();

// inital page render
load(window.location.pathname);

RequestManager.init().then(data => {

	if (typeof data !== 'object') {
		view.showModal('modal-server-down');
		return;
	}

	if (data.email) {
		prefManager.setGoogleAccount(data);
		render.showPrefs();
		analytics.setRegisteredTo(data.email);
	}

	analytics.setNewLoad(!!data.device_id);

	if (Storage.deviceIdExists()) {
		analytics.setDeviceId(Storage.getDeviceId());
		analytics.setTheme(prefManager.getThemeNum());
	} else {
		view.showModal('modal-server-down');
		throw 'Device id was not established';
	}

	view.fillDeviceIds();
}).catch(err => {	
	RequestManager.sendError({
		where: 'client_page_load',
		description: err.stack
	});
	
	if (!Storage.deviceIdExists()) {
		view.switchTo('error');
	}

});

// makes sure that back and forwards buttons work
window.onpopstate = () => load(window.location.pathname);

// sends analytics
analytics.setPathname(window.location.pathname);

// add service workers
/*if (navigator.serviceWorker) {
	navigator.serviceWorker.register('/sw.js').then((reg) => {
		console.log(reg);
		Logger.log('main', 'service worker registered');
	}).catch(err => {
		Logger.log('main', 'service worker registration failed');
		console.error(err);
	})
}*/

if (window.chrome && !window.localStorage.chrome_extension_installed) {
	setTimeout(() => {
		view.notify('Install the <a style="display: inline;" target="_blank" href="https://www.mvhs.club/u/bell-extn">Chrome Extension</a>');
	}, 3000);
}

// welcome, cause what else is the computer going to do?
let val = ['Welcome', '欢迎', 'स्वागत हे', 'Bienvenido', 'خوش آمدی', 'Bienvenue', 'желанный', 'Bem vinda', 'Benvenuto', 'Gratus mihi venis', 'Welkom', 'ברוך הבא', 'ようこそ'][Math.floor(Math.random() * 13)];
console.log(`%c${val}`, 'background: #fccb0b; color: #000; font-size: 34px; padding: 6px 20px; font-family: \'sans-serif\'; border-radius: 4px;');

// has to be global for google
function googleApiDidLoad() {

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

				RequestManager.login(account).then(res => {
					if (res.data.status === 'returning_user') {
						prefManager.setGoogleAccount(res.data.user_data);
						view.settingChangesSaved();
					} else if (res.data.status === 'new_user') {
						prefManager.setGoogleAccount(res.data.user_data);
					} else {
						view.showModal('modal-server-down');
					}

					render.showPrefs();
				}).catch(err => {
					view.showModal('modal-server-down');
				});
			}

			let gFail = () => window.alert('Google had trouble signing you in. Please try again later.');

			for (let element of document.getElementsByClassName('google-login-button'))
				GoogleAuth.attachClickHandler(element, {}, gSuccess, gFail);
		});
	});

};
