import Logger from './Logger';

export function addServiceWorker(path) {
	if (navigator.serviceWorker) {
		navigator.serviceWorker.register(path).then((reg) => {
			Logger.log('main', 'service worker registered');
		}).catch(err => {
			Logger.log('main', 'service worker registration failed');
			console.error(err);
		})
		return true;
	}
	return false;
}

export function googleApiDidLoad(render) {
	return () => gapi.load('auth2', () => {
		gapi.auth2.init({
			client_id: '770077939711-hbanoschq9p65gr8st8grsfbku4bsnhl.apps.googleusercontent.com',
			cookiepolicy: 'single_host_origin',
			scope: 'profile email'
		}).then(GoogleAuth => {
			let gSuccess = user => {
				view.showModal('modal-loading');

				RequestManager.login(user.getAuthResponse().id_token).then(res => {
					view.closeModal();

					if (res.data.status === 'returning_user' || res.data.status === 'new_user') {
						prefManager.setGoogleAccount(res.data.user_data);
					} else {
						view.showModal('modal-server-down');
					}

					render.showPrefs();
				}).catch(err => {
					console.log(err);
					view.showModal('modal-server-down');
				});
			}

			let gFail = () => window.alert('Google had trouble signing you in. Please try again later.');

			document.querySelector('#modal-body .modal-login').innerHTML = 'After logging in with Google, you will gain access to numerous features including the ability to have personalized period names and custom themes.<br><br><a class="google-login-button">Click here</a> to log in with your Google Account.';

			for (let element of document.getElementsByClassName('google-login-button')) {
				GoogleAuth.attachClickHandler(element, {}, gSuccess, gFail);
			}
		});
	});
}

export function greeting() {
	let greeting = ['Welcome', '欢迎', 'स्वागत हे', 'Bienvenido', 'خوش آمدی', 'Bienvenue', 'желанный', 'Bem vinda', 'Benvenuto', 'Gratus mihi venis', 'Welkom', 'ברוך הבא', 'ようこそ'][Math.floor(Math.random() * 13)];
	console.log(`%c${greeting}`, 'background: #fccb0b; color: #000; font-size: 34px; padding: 6px 20px; font-family: \'sans-serif\'; border-radius: 4px;');
	console.log('https://github.com/arjunpat/period-countdown');
}

export function getVersion() {
	for (let node of document.querySelectorAll('script')) {
		if (node.src.includes('/js/bundle.js?v='))
			return node.src.substring(node.src.indexOf('?v=') + 3);
	}
}

export function isFreePeriod(name) {
	if (typeof name !== 'string')
		return false;
	
	name = name.trim().toLowerCase();
	return ['free', 'none', 'nothin'].some(a => name.includes(a));
}

export function clone(obj) {
	return JSON.parse(JSON.stringify(obj));
}
