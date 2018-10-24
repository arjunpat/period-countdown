import Logger from './Logger';
import Storage from './Storage';

import Canvas from './components/Canvas';
import SchoolSelector from './components/SchoolSelector';
import PeriodNameEnterArea from './components/PeriodNameEnterArea';

export default class View {
	constructor() {

		Logger.time('View', 'grabbed-elements');

		this.currentValues = {};
		this.root = document.getElementById('root');

		this.preloader = document.getElementById('preloader');

		this.notifications = document.getElementById('notifications');

		this.index = {
			mainCanvas: document.getElementById('main-canvas'),
			mainCanvasOverlay: document.getElementById('main-canvas-overlay'),
			dayType: document.getElementById('day-type'),
			currentPeriodText: document.getElementById('current-period-text'),
			timeLeft: document.getElementById('time-left'),
			settingsButton: document.getElementById('settings-button'),
			googleSignin: document.getElementById('google-signin'),
			scheduleTable: document.getElementById('schedule-table')
		}
		this.settings = {
			title: document.querySelector('#settings #title'),
			changesSaved: document.getElementById('changes-saved'),
			chooseSettings: document.getElementById('choose-settings'),
			inputs: document.querySelectorAll('#choose-settings input'),
			closeButton: document.getElementById('settings-close'),
			themeSelector: document.getElementById('theme-selector'),
			themeExamples: document.getElementsByClassName('theme-example'),
			saveSettingsButton: document.getElementById('save-settings-button'),
			foundBug: document.getElementById('found-bug'),
			gradientOnly: document.getElementById('gradient-only'),
			schoolSelector: new SchoolSelector(document.getElementById('school-selector')),
			periodNameEnterArea: new PeriodNameEnterArea(document.getElementById('period-name-enter-area')),
			saved: true
		}
		this.modal = {
			open: false,
			title: document.getElementById('modal-title'),
			body: document.getElementById('modal-body'),
			footer: document.getElementById('modal-footer')
		}

		this.canvas = new Canvas(this.index.mainCanvas);
		this.modal.footer.querySelector('a').onclick = this.closeModal;
		this.fillDeviceIds();

		Logger.timeEnd('View', 'grabbed-elements');

	}

	updateScreen(time, showVisuals) {

		let returnVal = false;
		let {percentCompleted, hours, minutes, seconds, periodName, dayType} = time;

		// make time human readable
		seconds = padNum(seconds);
		if (hours !== 0)
			minutes = padNum(minutes);

		let timeString = '';
		if (hours !== 0)
			timeString = `${hours}:`;

		timeString += `${minutes}:${seconds}`;

		let documentTitle = `${timeString} \u2022 ${periodName}`;
		if (this.currentValues.documentTitle !== documentTitle) {
			document.title = documentTitle;
			this.currentValues.documentTitle = documentTitle;
		}

		if (showVisuals) {
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
				returnVal = true;
			}

			if (this.currentValues.currentPeriodText !== periodName) {
				this.index.currentPeriodText.innerText = periodName;

				// animation
				this.index.currentPeriodText.style.animation = '.6s updatePeriod'
				setTimeout(() => this.index.currentPeriodText.style.animation = 'none', 1e3);
				this.currentValues.currentPeriodText = periodName;
				returnVal = true;
			}

			if (this.currentValues.timeLeftText !== timeString) {
				this.index.timeLeft.innerText = timeString;
				this.currentValues.timeLeftText = timeString;
			}

		}

		return returnVal;
	}

	updateViewWithState(preferences, meta) {
		// theme stuff
		this.canvas.updateColors(preferences.theme.background, preferences.theme.completed);
		this.index.mainCanvasOverlay.style.color = preferences.theme.text;
		this.index.settingsButton.querySelector('div').style.background = preferences.theme.text;

		if (typeof preferences.theme.background === 'object') { // if gradient background
			this.index.settingsButton.querySelector('div > i').style.color = preferences.theme.background.stops[preferences.theme.background.stops.length - 1];
		} else {
			this.index.settingsButton.querySelector('div > i').style.color = preferences.theme.background;
		}

		this.showThemeColorExamples(preferences.theme);
		this.settings.themeSelector.value = preferences.theme.num;

		this.settings.schoolSelector.setSchoolOptions(preferences.schoolOptions);
		this.settings.periodNameEnterArea.setPeriods(meta.periods);

		if (preferences.googleAccount.signed_in) {
			this.index.googleSignin.querySelector('button').style.display = 'none';
			this.index.googleSignin.querySelector('div > img').src = preferences.googleAccount.profile_pic + '?sz=70';
			this.index.googleSignin.querySelector('div > img').style.display = 'block';

			this.settings.periodNameEnterArea.setDisabled(false);
			this.settings.periodNameEnterArea.setPreferences(preferences.periodNames);
			this.settings.schoolSelector.setSelection(preferences.school);

			this.settings.themeSelector.disabled = '';
			this.settings.saveSettingsButton.disabled = '';
			this.settingChangesSaved();
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

				if (scheduleBuilder.isPeriod(p.n)) {
					p.n = periodNames[p.n] || p.n;
				}

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

	showThemeColorExamples(theme) {

		if (typeof theme.background === 'object') {
			for (let input of this.settings.themeExamples) {
				input.style.display = 'none';
			}
			this.settings.gradientOnly.style.display = 'block';

		} else {
			for (let input of this.settings.themeExamples) {
				input.style.display = 'block';
			}
			this.settings.gradientOnly.style.display = 'none';
			
			this.settings.themeExamples[0].style.background = theme.completed;
			this.settings.themeExamples[1].style.background = theme.background;
			this.settings.themeExamples[0].style.color = theme.text;
			this.settings.themeExamples[1].style.color = theme.text;
		}
	}

	switchTo(id) {
		let screens = this.root.children;

		for (let i = 0; i < screens.length; i++) {
			if (screens[i].id === id) {
				screens[i].style.display = 'block';
				setTimeout(() => { screens[i].style.opacity = '1'; }, 20);
			} else {
				screens[i].style.opacity = '0';
				setTimeout(() => { screens[i].style.display = 'none'; }, 200);
			}
		}

		this.updateScreenDimensions();
	}

	updateScreenDimensions() {
		let dimension = window.innerWidth;

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

	setLockScreenState(state) {
		if (typeof state !== 'boolean')
			throw new TypeError('invalid arguments');
		document.body.style.overflow = state ? 'hidden' : 'auto';
	}

	showModal(screen) {
		let screens = this.modal.body.children;

		for (let i = 0; i < screens.length; i++)
			if (screens[i].classList.contains(screen))
				screens[i].style.display = 'block';
			else
				screens[i].style.display = 'none';

		let titles = this.modal.title.children;

		for (let i = 0; i < titles.length; i++)
			if (titles[i].classList.contains(screen))
				titles[i].style.display = 'block';
			else
				titles[i].style.display = 'none';

		let modalStyle = this.root.querySelector('#modal').style;
		modalStyle.display = 'block';

		setTimeout(() => {
			modalStyle.opacity = '1';
			modalStyle.transform = 'translateY(0)';
		}, 20);

		this.modal.open = true;
	}

	closeModal() {
		document.querySelector('#root #modal').style.opacity = '0';
		setTimeout(() => {
			document.querySelector('#root #modal').style.display = 'none';
			document.querySelector('#root #modal').style.transform = 'translateY(-500px)';
		}, 400);
		view.modal.open = false; // TODO pls no reference like this! fix
	}

	addGoogleApi() {
		if (this.googleApiAdded)
			return;

		let script = document.createElement('script');
		script.src = 'https://apis.google.com/js/platform.js?onload=googleApiDidLoad';
		script.async = 'true';
		script.defer = 'true';
		document.body.append(script);

		this.googleApiAdded = true;
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

	settingChangesNotSaved() {
		this.settings.saved = false;
		this.settings.changesSaved.style.background = '#464646';
		this.settings.changesSaved.querySelector('span').style.color = '#fff';
		this.settings.changesSaved.querySelector('span').innerHTML = 'Click save to save changes';
	}

	settingChangesSaved() {
		this.settings.saved = true;
		this.settings.changesSaved.style.background = '';
		this.settings.changesSaved.querySelector('span').style.color = '';
		this.settings.changesSaved.querySelector('span').innerHTML = 'All changes saved in the cloud';
	}


	notify(html) {
		this.notifications.querySelector('span').innerHTML = html;
		this.notifications.style.bottom = '15px';
		this.notifications.querySelectorAll('span')[1].onclick = () => view.hideNotification();
	}

	hideNotification() {
		this.notifications.style.bottom = '';
	}

	notifyAndHide(html, seconds) {
		this.notify(html);
		setTimeout(this.hideNotification, 5000);
	}

	fillDeviceIds() {
		if (!Storage.deviceIdExists())
			return;

		let d = Storage.getDeviceId();

		for (let ele of document.getElementsByClassName('device-id')) {
			ele.innerText = d;
		}
	}

	getSelectedThemeNum() { return parseInt(this.settings.themeSelector.value); }

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