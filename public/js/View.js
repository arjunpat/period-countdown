'use strict';

class View {
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
		let {percent_completed, hours, minutes, seconds, period_name, day_type} = time;

		// make time human readable
		seconds = padNum(seconds);
		if (hours !== 0)
			minutes = padNum(minutes);

		let timeString = '';
		if (hours !== 0)
			timeString = `${hours}:`;

		timeString += `${minutes}:${seconds}`;

		if (typeof period_name === 'number')
			period_name = formatPeriodNumber(period_name);

		let documentTitle = `${timeString} \u2022 ${period_name}`;
		if (this.currentValues.documentTitle !== documentTitle) {
			document.title = documentTitle;
			this.currentValues.documentTitle = documentTitle;
		}

		if (showVisuals) {
			if ((percent_completed < 1 && this.canvas.props.decimalCompleted <= .1 && !this.canvas.animationInterval) || (percent_completed > 99 && this.canvas.props.decimalCompleted >= .99)) {
				this.canvas.draw(percent_completed / 100); // more specific at the beginning or end
			} else if (!this.canvas.animationInterval || Math.abs(percent_completed - (100 * this.canvas.props.decimalAnimatingTowards)) > 2) {
				this.canvas.animate(Math.floor(percent_completed) / 100);
			}


			if (this.currentValues.dayTypeText !== day_type) {
				this.index.dayType.innerText = day_type;
				this.currentValues.dayTypeText = day_type;
				returnVal = true;
			}

			if (this.currentValues.currentPeriodText !== period_name) {
				this.index.currentPeriodText.innerText = period_name;

				// animation
				this.index.currentPeriodText.style.animation = '.6s updatePeriod'
				setTimeout(() => this.index.currentPeriodText.style.animation = 'none', 1e3);
				this.currentValues.currentPeriodText = period_name;
				returnVal = true;
			}

			if (this.currentValues.timeLeftText !== timeString) {
				this.index.timeLeft.innerText = timeString;
				this.currentValues.timeLeftText = timeString;
			}

		}

		return returnVal;
	}

	applyPreferencesToElements(values) {
		// theme stuff
		this.canvas.updateColors(values.theme.background, values.theme.completed);
		this.index.mainCanvasOverlay.style.color = values.theme.text;
		this.index.settingsButton.querySelector('div').style.background = values.theme.text;
		this.index.settingsButton.querySelector('div > i').style.color = values.theme.background;

		this.showThemeColorExamples(values.theme);
		this.settings.themeSelector.value = values.theme.num;

		if (values.google_account.signed_in) {
			this.index.googleSignin.querySelector('button').style.display = 'none';
			this.index.googleSignin.querySelector('div > img').src = values.google_account.profile_pic + '?sz=70';
			this.index.googleSignin.querySelector('div > img').style.display = 'block';

			this.settings.themeSelector.disabled = '';
			this.settings.saveSettingsButton.disabled = '';
			this.settingChangesSaved();

			for (let element of this.settings.inputs)
				element.disabled = '';
		}

		if (values.period_names)
			for (let element of this.settings.inputs) {
				let num = this.getIdFromInputElem(element);
				this.showPeriodInput(element, values.free_periods[num], values.period_names[num])
			}

	}

	showPeriodInput(element, isFree, value = null) {
		let num = element.id.substring(6, 7);
		let label = element.nextElementSibling;

		element.classList.remove('free-period');
		label.innerHTML = label.innerHTML.replace(' - removed from schedule', '');

		if (isFree) {
			element.classList.add('free-period');
			if (!label.innerHTML.includes(' - removed from schedule'))
				label.innerHTML += ' - removed from schedule';
		}

		if (value === null)
			return;

		if (typeof value === 'string') {
			element.value = value;
			element.classList.add('has-value');
		} else {
			element.value = '';
			element.classList.remove('has-value');
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

				if (typeof p.n === 'number') {
					p.n = periodNames[p.n] || formatPeriodNumber(p.n);
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
		this.settings.themeExamples[0].style.background = theme.completed;
		this.settings.themeExamples[1].style.background = theme.background;
		this.settings.themeExamples[0].style.color = theme.text;
		this.settings.themeExamples[1].style.color = theme.text;
	}

	switchTo(screen) {
		let screens = this.root.children;

		for (let i = 0; i < screens.length; i++)
			if (screens[i].id === screen) {
				screens[i].style.display = 'block';
				setTimeout(() => { screens[i].style.opacity = '1'; }, 20);
			} else {
				screens[i].style.opacity = '0';
				setTimeout(() => { screens[i].style.display = 'none'; }, 200);
			}

		this.updateScreenDimensions();
	}

	updateScreenDimensions() {
		let dimension = window.innerWidth;
		this.index.dayType.parentElement.style.fontSize = Math.min(55, dimension / 16) + 'px';
		this.index.dayType.parentElement.parentElement.style.padding = Math.min(50, dimension / 22) + 'px';
		this.index.timeLeft.style.fontSize = Math.min(170, dimension / (this.index.timeLeft.innerText.length - 3)) + 'px';
		this.index.settingsButton.style.padding = Math.min(45, dimension / 18) + 'px';
		this.index.settingsButton.querySelector('div').style.padding = Math.min(18, dimension / 28) + 'px';

		if (window.innerHeight > 800 && dimension > 900)
			document.body.style.overflow = 'hidden'; // locks screen
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

	getValuesFromAllPeriodInputs() {
		let names = {};
		for (let element of this.settings.inputs) {
			let num = this.getIdFromInputElem(element);
			names[num] = element.value.trim();
		}

		return names;
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

	getIdFromInputElem(element) { return parseInt(element.id.substring(6, 7)); }

	getSelectedThemeNum() { return parseInt(this.settings.themeSelector.value); }

	dimensionCanvas() { this.canvas.dimension(); }
}

// helper functions
function getOrdinalNumber(n) {
	return n + (n > 0 ? ["th", "st", "nd", "rd"][n > 3 && 21 > n || n % 10 > 3 ? 0 : n % 10] : "");
}

function formatPeriodNumber(n) {
	return getOrdinalNumber(n) + ' Period';
}

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