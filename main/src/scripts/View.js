import { logger } from './init';
import { isExtn } from './extras';
import Storage from './Storage';
import RequestManager from './RequestManager';

import Modal from './components/Modal';
import Canvas from './components/Canvas';

export default class View {
	constructor() {

		logger.time('View', 'grabbed-elements');

		this.currentValues = {};
		this.preloader = document.getElementById('preloader');
		this.notification = document.getElementById('notification');

		this.index = {
			mainCanvas: document.getElementById('main-canvas'),
			mainCanvasOverlay: document.getElementById('main-canvas-overlay'),
			dayType: document.getElementById('day-type'),
			currentPeriodText: document.getElementById('current-period-text'),
			timeLeft: document.getElementById('time-left'),
			settingsButton: document.getElementById('settings-button'),
			googleSignin: document.getElementById('google-signin'),
			scheduleTable: document.getElementById('schedule-table'),
			isACrawler: /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent)
		}

		this.modal = new Modal(document.getElementById('modal'));
		this.canvas = new Canvas(this.index.mainCanvas);

		this.notification.querySelectorAll('span')[1].onclick = this.hideNotification.bind(this);

		logger.timeEnd('View', 'grabbed-elements');
	}

	updateScreen(time, showVisuals) {
		let { percentCompleted, hours, minutes, seconds, periodName, dayType } = time;

		// make time human readable
		seconds = padNum(seconds);
		if (hours !== 0)
			minutes = padNum(minutes);

		let timeString = '';
		if (hours !== 0)
			timeString = `${hours}:`;

		timeString += `${minutes}:${seconds}`;

		if (!isExtn) {
			// the cringier, the better
			let bodies = [
				'Did you turn in your homework?',
				'Go give your teacher a hug!',
				'Grab your things!',
				'Whew!',
				'Finally!!',
				'Prepare to blast',
				'Gone so soon?',
				'It\'ll be hard to say goodbye',
				'Your partner will miss you',
				'Farewell',
				'Bye Felicia',
				'Give a care, push in your chair!',
				'Too cool for class?',
				'Promise you\'ll come back?',
			]

			if (timeString === '5:00') {
				let body;

				if (Math.random() < .4) {
					body = bodies[Math.floor(Math.random() * bodies.length)]
				}

				new Notification(`5 min left of '${periodName}'`, {
					icon: '/img/1024.png',
					body
				});
			}
		}

		let documentTitle = `${timeString} \u2022 ${periodName}`;
		if (this.currentValues.documentTitle !== documentTitle && !this.index.isACrawler && !isExtn) {
			document.title = documentTitle;
			this.currentValues.documentTitle = documentTitle;
		}

		if (showVisuals || isExtn) {
			if (
				(percentCompleted < 1 && this.canvas.props.decimalCompleted <= .1 && !this.canvas.animationInterval)
				|| (percentCompleted > 99 && this.canvas.props.decimalCompleted >= .99)
			) {
				this.canvas.draw(percentCompleted / 100); // more specific at the beginning or end
			} else if (!this.canvas.animationInterval) {
				this.canvas.animate(Math.floor(percentCompleted) / 100, 2);
			}


			if (this.currentValues.dayTypeText !== dayType) {
				this.index.dayType.innerText = dayType;
				this.currentValues.dayTypeText = dayType;
			}

			if (this.currentValues.currentPeriodText !== periodName) {
				this.index.currentPeriodText.innerText = periodName;

				// animation
				this.index.currentPeriodText.style.animation = '.6s updatePeriod'
				setTimeout(() => this.index.currentPeriodText.style.animation = 'none', 1e3);
				this.currentValues.currentPeriodText = periodName;
			}

			if (this.currentValues.timeLeftText !== timeString) {
				this.index.timeLeft.innerText = timeString;
				this.currentValues.timeLeftText = timeString;
			}

		}
	}

	updateViewWithState(preferences) {
		// theme stuff
		this.canvas.updateColors(preferences.theme.b, preferences.theme.c);
		this.index.mainCanvasOverlay.style.color = preferences.theme.t;
		this.index.settingsButton.querySelector('div').style.background = preferences.theme.t;

		let b = preferences.theme.b;
		this.index.settingsButton.querySelector('div > i').style.color = b.substring(b.lastIndexOf('#'), b.lastIndexOf(')'));
		this.index.settingsButton.querySelector('div > i').style.color = b;

		if (preferences.googleAccount) {
			this.index.googleSignin.querySelector('button').style.display = 'none';

			let size = 70 * (window.devicePixelRatio || 1);
			this.index.googleSignin.querySelector('div > img').src = preferences.googleAccount.profile_pic + '?sz=' + size;
			this.index.googleSignin.querySelector('div > img').style.display = 'block';
		}
	}

	updateScheduleTable(periods, periodNames, currentTime) {
		let currentDate = (new Date(currentTime)).setHours(0, 0, 0, 0);

		let html = '';
		let added = 0;
		for (let i = 0; i < periods.length - 1 && added < 8; i++) {
			let p = periods[i];

			if (p.n !== 'Passing' && p.n !== 'Free') {

				if ((new Date(p.f)).setHours(0, 0, 0, 0) !== currentDate)
					continue;

				p.n = periodNames[p.n] || p.n;

				html += `
					<tr>
						<td>${p.n}</td>
						<td>${formatEpoch(p.f)} - ${formatEpoch(periods[i + 1].f)}</td>
					</tr>
				`;

				added++;
			}

		}

		if (added === 0)
			html = '<span style="color: black; font-style: italic;">No classes today</span>'

		this.index.scheduleTable.querySelector('table > tbody').innerHTML = html;
	}

	updateScreenDimensions() {
		let dimension = window.innerWidth;

		if (isExtn) {
			this.index.dayType.parentElement.style.fontSize = Math.min(50, (dimension / this.index.dayType.parentElement.innerText.length) / .6) + 'px';
			this.index.timeLeft.style.fontSize = Math.min(120, dimension / (this.index.timeLeft.innerText.length - 2)) + 'px';
		} else {
			this.index.settingsButton.style.padding = Math.min(45, dimension / 18) + 'px';
			this.index.settingsButton.querySelector('div').style.padding = Math.min(18, dimension / 28) + 'px';
			this.index.dayType.parentElement.style.fontSize = Math.min(55, dimension / 16) + 'px';
			this.index.dayType.parentElement.parentElement.style.padding = Math.min(50, dimension / 22) + 'px';

			if (dimension > 450) {
				this.index.timeLeft.style.fontSize = Math.min(170, dimension / (this.index.timeLeft.innerText.length - 3)) + 'px';
			} else {
				// mobile sizing
				this.index.timeLeft.style.fontSize = Math.min(120, dimension / (this.index.timeLeft.innerText.length - 2)) + 'px';
			}
		}		
	}

	hidePreloader() {
		if (this.preloader.style.display !== 'none') {

			this.preloader.querySelector('div').style.opacity = '0';
			this.preloader.style.opacity = '0';
			this.preloader.style.pointerEvents = 'none';
			setTimeout(() => {
				this.preloader.style.display = 'none';
			}, 2000);

		}
	}

	notify(html) {
		this.notification.querySelector('span').innerHTML = html;
		this.notification.style.bottom = '15px';
	}

	hideNotification() {
		this.notification.style.bottom = '';
	}

	notifyAndHide(html, seconds) {
		this.notify(html);
		setTimeout(this.hideNotification, 5000);
	}

	showModal(title, body) {
		this.modal.show(title, body);
		setTimeout(() => {
			document.getElementById('enable-notifications').onclick = () => {
				Notification.requestPermission();
				RequestManager.notifOn();
			}
		}, 100);
	}

	dimensionCanvas() { this.canvas.dimension(); }
}

// helper functions
function padNum(n) {
	if (n < 10)
		return '0' + n;
	return n;
}

function formatEpoch(t) {
	let d = new Date(t);
	let h = d.getHours();
	let m = d.getMinutes();

	if (h > 12)
		h -= 12;

	return `${h}:${padNum(m)}`;
}
