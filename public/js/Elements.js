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
			inputs: document.querySelectorAll('#choose-settings input'),
			closeButton: document.getElementById('settings-close'),
			themeSelector: document.getElementById('theme-selector'),
			themeExamples: document.getElementsByClassName('theme-example'),
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

	applyPreferencesToElements(values) {
		// theme stuff
		this.canvas.updateColors(values.theme.color.background, values.theme.color.completed);
		this.index.mainCanvasOverlay.style.color = values.theme.color.text;
		this.index.settingsButton.querySelector('div').style.background = values.theme.color.text;
		this.index.settingsButton.querySelector('div > i').style.color = values.theme.color.background;

		this.settings.themeExamples[0].style.background = values.theme.color.completed;
		this.settings.themeExamples[1].style.background = values.theme.color.background;
		this.settings.themeExamples[0].style.color = values.theme.color.text;
		this.settings.themeExamples[1].style.color = values.theme.color.text;
		this.settings.themeSelector.value = values.theme.name;

		if (values.google_account.signed_in) {
			this.index.googleSignin.querySelector('button').style.display = 'none';
			this.index.googleSignin.querySelector('div > img').src = values.google_account.profile_pic + '?sz=70';
			this.index.googleSignin.querySelector('div > img').style.display = 'block';

			this.settings.themeSelector.disabled = '';
			this.settings.changesSaved.querySelector('span').innerText = 'All changes saved in the cloud';

			for (let element of this.settings.inputs) {
				element.disabled = '';
			}
		}

		let period_names = values.period_names;

		if (period_names)
			for (let element of this.settings.inputs) {
				let num = element.id.substring(6, 7);
				if (period_names[num]) {
					element.value = period_names[num];
					element.classList.add('has-value');
				}
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
		this.index.settingsButton.style.padding = Math.min(45, dimension / 18) + 'px';
		this.index.settingsButton.querySelector('div').style.padding = Math.min(18, dimension / 28) + 'px';

		if (dimension > 1000) {
			document.body.style.overflow = 'hidden'; // locks screen
		}
	}

	showModal(screen) {
		let screens = this.modal.body.children;

		for (let i = 0; i < screens.length; i++) {
			if (screens[i].classList.contains(screen)) {
				screens[i].style.display = 'block';
			} else {
				screens[i].style.display = 'none';
			}
		}

		let titles = this.modal.title.children;

		for (let i = 0; i < titles.length; i++) {
			if (titles[i].classList.contains(screen)) {
				titles[i].style.display = 'block';
			} else {
				titles[i].style.display = 'none';
			}
		}

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
		elements.modal.open = false; // TODO pls no reference like this! fix
	}

	addGoogleApi() {
		let script = document.createElement('script');
		script.src = 'https://apis.google.com/js/platform.js?onload=googleApiDidLoad';
		script.async = 'true';
		script.defer = 'true';
		document.body.append(script);
	}

	settingChangesNotSaved() {
		this.settings.saved = false;
		this.settings.changesSaved.style.background = '#464646';
		this.settings.changesSaved.querySelector('span').style.color = '#fff';
		this.settings.changesSaved.querySelector('span').innerHTML = 'Saving changes...';
	}

	settingChangesSaved() {
		this.settings.saved = true;
		this.settings.changesSaved.style.background = '';
		this.settings.changesSaved.querySelector('span').style.color = '';
		this.settings.changesSaved.querySelector('span').innerHTML = 'All changes saved in the cloud';
	}

	setThemeExampleColors(text, overlay, background) {

	}

	dimensionCanvas() { this.canvas.dimension() }

	getOrdinalNum(e) { return e + (e > 0 ? ["th", "st", "nd", "rd"][e > 3 && 21 > e || e % 10 > 3 ? 0 : e % 10] : "") }
}
