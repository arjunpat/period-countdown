import { mainVersion } from '../../../common';

Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
        var alt = {};

        Object.getOwnPropertyNames(this).forEach(function (key) {
            alt[key] = this[key];
        }, this);

        return alt;
    },
    configurable: true,
    writable: true
});

export function removeServiceWorker() {
	if (navigator.serviceWorker) {
		navigator.serviceWorker.getRegistrations().then(regs => {
			for (let reg of regs) {
				reg.unregister();
			}
		});
	}
}

export function greeting() {
	let greeting = ['Welcome', '欢迎', 'स्वागत हे', 'Bienvenido', 'خوش آمدی', 'Bienvenue', 'желанный', 'Bem vinda', 'Benvenuto', 'Gratus mihi venis', 'Welkom', 'ברוך הבא', 'ようこそ'][Math.floor(Math.random() * 13)];
	console.log(`%c${greeting}`, 'background: #fccb0b; color: #000; font-size: 34px; padding: 6px 20px; font-family: \'sans-serif\'; border-radius: 4px;');
	console.log('https://github.com/arjunpat/period-countdown');
}

export function getVersion() {
	/*for (let node of document.querySelectorAll('script')) {
		if (node.src.includes('bundle.js?v='))
			return node.src.substring(node.src.indexOf('?v=') + 3);
	}*/

	return mainVersion;
}

export function clone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

export const isExtn = window.location.pathname === '/extn';
