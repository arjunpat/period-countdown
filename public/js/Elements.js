'use strict';

class Elements {
	constructor() {

		this.currentValues = {};
		this.root = document.getElementById('root');

		this.index = {
			mainCanvas: document.getElementById('main-canvas'),
			mainCanvasOverlay: document.getElementById('main-canvas-overlay'),
			dayType: document.getElementById('day-type'),
			currentPeriodText: document.getElementById('current-period-text'),
			timeLeft: document.getElementById('time-left'),
			settingsButton: document.getElementById('settings-button'),
			googleSignin: document.getElementById('google-signin')
		}
		this.settings = {
			title: document.querySelector('#settings #title'),
			changesSaved: document.getElementById('changes-saved'),
			chooseSettings: document.getElementById('choose-settings'),
			inputs: document.querySelectorAll('#choose-settings input')
		}
		this.modal = {
			title: document.getElementById('modal-title'),
			body: document.getElementById('modal-body'),
			footer: document.getElementById('modal-footer')
		}

		this.index.googleSignin.querySelector('button').onclick = this.addGoogleApi;

		this.canvas = new Canvas(this.index.mainCanvas);
	}

	updateScreen(time) {

		let {percent_completed, days, hours, minutes, seconds, period_name, day_type, period_length} = time;

		// make time human readable
		if (seconds < 10) seconds = '0' + seconds;
		if (minutes < 10 && hours !== 0) minutes = '0' + minutes;

		let timeString = '';
		if (hours !== 0) timeString = `${hours}:`;
		timeString += `${minutes}:${seconds}`;

		if (typeof period_name === 'number') period_name = this.getOrdinalNum(period_name) + ' Period';

		let documentTitle = `${timeString} — ${period_name}`;
		if (this.currentValues.documentTitle !== documentTitle) {
			document.title = documentTitle;
			this.currentValues.documentTitle = documentTitle;
		}

		if (document.hasFocus() || true) {
			if ((percent_completed < 1 && this.canvas.props.decimalCompleted <= .1 && !this.canvas.animationInterval) || (percent_completed > 99 && this.canvas.props.decimalCompleted >= .99))
				this.canvas.draw(percent_completed / 100); // more specific at the beginning or end
			else if (!this.canvas.animationInterval || Math.abs(percent_completed - (100 * this.canvas.props.decimalAnimatingTowards)) > 2)
				this.canvas.animate(Math.floor(percent_completed) / 100);


			if (this.currentValues.dayTypeText !== day_type) {
				this.index.dayType.innerText = day_type;
				this.currentValues.dayTypeText = day_type;
			}


			if (this.currentValues.currentPeriodText !== period_name) {
				this.index.currentPeriodText.innerText = period_name;
				// animation
				
				this.index.currentPeriodText.style.animation = '.6s updatePeriod'
				setTimeout(() => this.index.currentPeriodText.style.animation = 'none', 1e3);
				this.currentValues.currentPeriodText = period_name;
			}

			if (this.currentValues.timeLeftText !== timeString) {
				this.index.timeLeft.innerText = timeString;
				this.currentValues.timeLeftText = timeString;
			}

		}
	}

	updateElementsWithPreferences(values) {
		// theme stuff
		this.canvas.updateColors(values.theme.color.background, values.theme.color.completed);
		this.index.mainCanvasOverlay.style.color = values.theme.color.text;
		this.index.settingsButton.querySelector('div').style.background = values.theme.color.text;
		this.index.settingsButton.querySelector('div > i').style.color = values.theme.color.background;

		if (values.google_account.first_name) {
			this.index.googleSignin.querySelector('button').style.display = 'none';
			this.index.googleSignin.querySelector('div > img').src = values.google_account.profile_pic + '?sz=70';
			this.index.googleSignin.querySelector('div > img').style.display = 'block';
		}

	}

	switchTo(screen) {
		let screens = this.root.children;

		for (let i = 0; i < screens.length; i++) {
			if (screens[i].id === screen) {
				screens[i].style.display = 'block';
				setTimeout(() => { screens[i].style.opacity = '1'; }, 20);
			} else {
				screens[i].style.opacity = '0';
				setTimeout(() => { screens[i].style.display = 'none'; }, 200);
			}
		}
	}

	updateScreenFontSize() {
		let dimension = window.innerWidth;
		this.index.dayType.parentElement.style.fontSize = Math.min(55, dimension / 16) + 'px';
		this.index.dayType.parentElement.parentElement.style.padding = Math.min(50, dimension / 22) + 'px';
		this.index.timeLeft.style.fontSize = Math.min(170, dimension / (this.index.timeLeft.innerText.length - 3)) + 'px';

		if (dimension > 1000) {
			document.body.style.overflow = 'hidden'; // locks screen
		}
	}

	addGoogleApi() {

		try {
			if (gapi) this.googleApiDidLoad()
		} catch (e) {
			let script = document.createElement('script');
			script.src = 'https://apis.google.com/js/platform.js?onload=googleApiDidLoad';
			script.async = 'true';
			script.defer = 'true';
			document.body.append(script);
		}
	}

	settingChangesSaving() {
		this.settings.changesSaved.classList.add('changes-saving');
		this.settings.changesSaved.querySelector('span').innerText = 'Saving...';
	}

	dimensionCanvas() { this.canvas.dimension() }

	getOrdinalNum(e) { return e + (e > 0 ? ["th", "st", "nd", "rd"][e > 3 && 21 > e || e % 10 > 3 ? 0 : e % 10] : "") }
}