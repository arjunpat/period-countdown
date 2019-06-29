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
	for (let node of document.querySelectorAll('script')) {
		if (node.src.includes('bundle.js?v='))
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
