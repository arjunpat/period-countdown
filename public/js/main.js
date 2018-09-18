import PrefManager from './PrefManager.js';
import Analytics from './Analytics.js';
import View from './View.js';
import RequestManager from './RequestManager.js';
import Logger from './Logger.js';
import Storage from './Storage.js';
import ScheduleBuilder from './ScheduleBuilder.js';
import TimingEngine from './TimingEngine.js';

import {render, load} from './render.js';

window.timingEngine = new TimingEngine();
window.view = new View();
window.analytics = new Analytics;
window.prefManager = new PrefManager;
window.scheduleBuilder = new ScheduleBuilder();
window.RequestManager = RequestManager;

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

window.onbeforeunload = () => {
	analytics.leaving();
}

// gets version
for (let node of document.querySelectorAll('script')) {
	if (node.src.includes('/js/bundle.js?v='))
		analytics.setVersion(node.src.substring(node.src.indexOf('?v=') + 3));
}

analytics.setPathname(window.location.pathname);

// add service workers
/*if (navigator.serviceWorker) {
	navigator.serviceWorker.register('/sw.js').then((reg) => {
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

// make sure computer update to pref changes on other computers
window.setInterval(() => {
	RequestManager.init().then(data => {

		if (data.email) {
			prefManager.setGoogleAccount(data);
			render.showPrefs();
		}
		
	});
}, 5 * 60 * 1000 /* five minutes */);

// welcome, cause what else is the computer going to do?
let greeting = ['Welcome', '欢迎', 'स्वागत हे', 'Bienvenido', 'خوش آمدی', 'Bienvenue', 'желанный', 'Bem vinda', 'Benvenuto', 'Gratus mihi venis', 'Welkom', 'ברוך הבא', 'ようこそ'][Math.floor(Math.random() * 13)];
console.log(`%c${greeting}`, 'background: #fccb0b; color: #000; font-size: 34px; padding: 6px 20px; font-family: \'sans-serif\'; border-radius: 4px;');
console.log('https://github.com/arjunpat/period-countdown');


// has to be global for google api
window.googleApiDidLoad = () => {

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

			document.querySelector('#modal-body .modal-login').innerHTML = 'After logging in with Google, you will gain a whole host of new features including the ability to have personalized period names and custom themes.<br><br><a class="google-login-button">Click here</a> to log in with your Google Account.';

			for (let element of document.getElementsByClassName('google-login-button'))
				GoogleAuth.attachClickHandler(element, {}, gSuccess, gFail);
		});
	});

}