'use strict';

class ExtnView {
	constructor() {

		Logger.time('View', 'grabbed-elements');

		this.currentValues = {};
		this.root = document.getElementById('root');

		this.preloader = document.getElementById('preloader');

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

		window.innerWidth = 400;
		window.innerHeight = 400;
		this.canvas = new Canvas(this.index.mainCanvas);

		Logger.timeEnd('View', 'grabbed-elements');
	}

	updateScreen(time) {

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

		// update the dom

		if ((percent_completed < 1 && this.canvas.props.decimalCompleted <= .1 && !this.canvas.animationInterval) || (percent_completed > 99 && this.canvas.props.decimalCompleted >= .99)) {
			this.canvas.draw(percent_completed / 100); // more specific at the beginning or end
		} else if (!this.canvas.animationInterval || Math.abs(percent_completed - (100 * this.canvas.props.decimalAnimatingTowards)) > 2) {
			this.canvas.animate(Math.floor(percent_completed) / 100);
		}

		if (this.currentValues.dayTypeText !== day_type) {
			this.index.dayType.innerText = day_type;
			this.currentValues.dayTypeText = day_type;
			this.updateScreenDimensions();
		}

		if (this.currentValues.currentPeriodText !== period_name) {
			this.index.currentPeriodText.innerText = period_name;

			// animation
			this.index.currentPeriodText.style.animation = '.6s updatePeriod'
			setTimeout(() => this.index.currentPeriodText.style.animation = 'none', 1e3);
			this.currentValues.currentPeriodText = period_name;
			this.updateScreenDimensions();
		}

		if (this.currentValues.timeLeftText !== timeString) {
			this.index.timeLeft.innerText = timeString;
			this.currentValues.timeLeftText = timeString;
		}
	}

	applyPreferencesToElements(values) {
		// theme stuff
		this.canvas.updateColors(values.theme.background, values.theme.completed);
		this.index.mainCanvasOverlay.style.color = values.theme.text;
		this.index.settingsButton.querySelector('div').style.background = values.theme.text;
		this.index.settingsButton.querySelector('div > i').style.color = values.theme.background;

		if (values.google_account.signed_in) {
			this.index.googleSignin.querySelector('button').style.display = 'none';
			this.index.googleSignin.querySelector('div > img').src = values.google_account.profile_pic + '?sz=70';
			this.index.googleSignin.querySelector('div > img').style.display = 'block';
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

	updateScreenDimensions() {
		let dimension = window.innerWidth;
		this.index.dayType.parentElement.style.fontSize = Math.min(50, (dimension / this.index.dayType.parentElement.innerText.length) / .6) + 'px';
		//this.index.dayType.parentElement.parentElement.style.padding = Math.min(50, dimension / 22) + 'px';
		this.index.timeLeft.style.fontSize = Math.min(120, dimension / (this.index.timeLeft.innerText.length - 2)) + 'px';
	}

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
